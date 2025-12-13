import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { db, users, eq } from "@monorepo/db";
import type { User } from "@monorepo/db";
import {
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import { EmailService } from "./email.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService
  ) {}

  async validateUser(
    email: string,
    password: string
  ): Promise<Omit<User, "password"> | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      throw new ConflictException("Email già registrata");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .returning();

    // Send verification email
    await this.emailService.sendVerificationEmail(
      email,
      name,
      verificationToken
    );

    const { password: _, ...userWithoutPassword } = user;

    // Auto-login: generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });

    return {
      message: "Registrazione completata",
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(user: Omit<User, "password">, rememberMe: boolean = false) {
    // TODO: Riabilitare quando il servizio email sarà configurato
    // if (!user.emailVerified) {
    //   throw new UnauthorizedException(
    //     "Email non verificata. Controlla la tua casella di posta."
    //   );
    // }

    const payload = { sub: user.id, email: user.email, role: user.role };

    // Access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
    });

    // Refresh token (long-lived, only if remember me)
    let refreshToken: string | null = null;
    if (rememberMe) {
      refreshToken = this.jwtService.sign(payload, {
        expiresIn: "7d",
      });

      // Save refresh token to database
      await db
        .update(users)
        .set({ refreshToken, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async verifyEmail(token: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));

    if (!user) {
      throw new BadRequestException("Token non valido");
    }

    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException("Token scaduto");
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { message: "Email verificata con successo" };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      // Don't reveal if user exists
      return {
        message:
          "Se l'email esiste, riceverai un link per reimpostare la password",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await this.emailService.sendPasswordResetEmail(
      email,
      user.name,
      resetToken
    );

    return {
      message:
        "Se l'email esiste, riceverai un link per reimpostare la password",
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token));

    if (!user) {
      throw new BadRequestException("Token non valido");
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException("Token scaduto");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { message: "Password reimpostata con successo" };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub));

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException("Refresh token non valido");
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: "15m",
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException("Refresh token non valido o scaduto");
    }
  }

  async logout(userId: string) {
    await db
      .update(users)
      .set({ refreshToken: null, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return { message: "Logout effettuato" };
  }

  async resendVerificationEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      throw new NotFoundException("Utente non trovato");
    }

    if (user.emailVerified) {
      throw new BadRequestException("Email già verificata");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await this.emailService.sendVerificationEmail(
      email,
      user.name,
      verificationToken
    );

    return { message: "Email di verifica inviata" };
  }
}
