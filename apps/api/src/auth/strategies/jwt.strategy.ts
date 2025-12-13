import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { db, users, eq } from "@monorepo/db";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from cookie
        (request) => {
          return request?.cookies?.access_token;
        },
        // Or from Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>("JWT_SECRET") || "super-secret-key",
    });
  }

  async validate(payload: JwtPayload) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    if (!user) {
      throw new UnauthorizedException();
    }

    // Return user without password
    const { password, ...result } = user;
    return result;
  }
}
