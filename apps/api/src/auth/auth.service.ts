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
import { db, users, userProfiles, eq } from "@monorepo/db";
import type { UserWithProfile } from "@monorepo/db/types";
import {
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  InviteUserDto,
  ActivateAccountDto,
} from "./dto/auth.dto";
import { UserRole } from "@monorepo/db/types";
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
  ): Promise<UserWithProfile | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...userWithoutPassword } = user;

      // Get profile
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id));

      return { ...userWithoutPassword, profile: profile || null };
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

    // Create user (auth data)
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .returning();

    // Create user profile (personal data)
    const [profile] = await db
      .insert(userProfiles)
      .values({
        userId: user.id,
        name,
      })
      .returning();

    // Send verification email
    await this.emailService.sendVerificationEmail(
      email,
      name,
      verificationToken
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "Registrazione completata. Verifica la tua email per accedere.",
      user: { ...userWithoutPassword, profile },
    };
  }

  async login(user: UserWithProfile, rememberMe: boolean = false) {
    // TODO: Riabilitare quando il servizio email sarà configurato
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        "Email non verificata. Controlla la tua casella di posta."
      );
    }

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

    // Get profile for user name
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

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
      profile?.name || "Utente",
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

    // Get profile for user name
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

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
      profile?.name || "Utente",
      verificationToken
    );

    return { message: "Email di verifica inviata" };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      throw new NotFoundException("Utente non trovato");
    }

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    const profileData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updateProfileDto.name !== undefined) {
      profileData.name = updateProfileDto.name;
    }

    if (updateProfileDto.birthDate !== undefined) {
      profileData.birthDate = updateProfileDto.birthDate;
    }

    if (updateProfileDto.address !== undefined) {
      profileData.address = updateProfileDto.address;
    }

    if (updateProfileDto.fiscalCode !== undefined) {
      profileData.fiscalCode = updateProfileDto.fiscalCode;
    }

    let profile;
    if (existingProfile) {
      // Update existing profile
      const [updatedProfile] = await db
        .update(userProfiles)
        .set(profileData)
        .where(eq(userProfiles.userId, userId))
        .returning();
      profile = updatedProfile;
    } else {
      // Create new profile (should not happen normally)
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId,
          name: updateProfileDto.name || "Utente",
          ...profileData,
        })
        .returning();
      profile = newProfile;
    }

    const { password: _, ...userWithoutPassword } = existingUser;

    return {
      message: "Profilo aggiornato con successo",
      user: { ...userWithoutPassword, profile },
    };
  }

  async getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    return { ...userWithoutPassword, profile: profile || null };
  }

  async inviteUser(inviteUserDto: InviteUserDto) {
    const { firstName, lastName, email, role } = inviteUserDto;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      throw new ConflictException("Email già registrata");
    }

    // Generate a random temporary password (user will set their own after verification)
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Validate and cast role
    const userRole = Object.values(UserRole).includes(role as UserRole)
      ? (role as UserRole)
      : UserRole.USER;

    // Create user (auth data)
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        role: userRole,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .returning();

    // Create user profile (personal data)
    const fullName = `${firstName} ${lastName}`.trim();
    const [profile] = await db
      .insert(userProfiles)
      .values({
        userId: user.id,
        name: fullName,
      })
      .returning();

    // Send invitation email
    await this.emailService.sendInvitationEmail(
      email,
      fullName,
      verificationToken
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "Utente invitato con successo. Riceverà un'email di invito.",
      user: { ...userWithoutPassword, profile },
    };
  }

  async activateAccount(activateAccountDto: ActivateAccountDto) {
    const { token, password } = activateAccountDto;

    // Find user by verification token
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verify email AND set password
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { message: "Account attivato con successo. Ora puoi accedere." };
  }
}
