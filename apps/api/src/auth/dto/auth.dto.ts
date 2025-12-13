export class RegisterDto {
  name: string;
  email: string;
  password: string;
}

export class LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export class ForgotPasswordDto {
  email: string;
}

export class ResetPasswordDto {
  token: string;
  password: string;
}

export class VerifyEmailDto {
  token: string;
}
