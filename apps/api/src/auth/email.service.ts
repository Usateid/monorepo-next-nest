import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    // In production, integrate with an email provider (Resend, SendGrid, etc.)
    // For now, just log the email
    this.logger.log(`
      ========================================
      📧 EMAIL DI VERIFICA
      ----------------------------------------
      To: ${email}
      Name: ${name}
      ----------------------------------------
      Ciao ${name}!
      
      Clicca sul link per verificare la tua email:
      ${verificationUrl}
      
      Il link scade tra 24 ore.
      ========================================
    `);

    // TODO: Integrate with email provider
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: email,
    //   subject: 'Verifica la tua email',
    //   html: `<p>Ciao ${name}!</p><p><a href="${verificationUrl}">Clicca qui per verificare la tua email</a></p>`,
    // });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    this.logger.log(`
      ========================================
      📧 EMAIL RESET PASSWORD
      ----------------------------------------
      To: ${email}
      Name: ${name}
      ----------------------------------------
      Ciao ${name}!
      
      Hai richiesto di reimpostare la password.
      Clicca sul link:
      ${resetUrl}
      
      Il link scade tra 1 ora.
      
      Se non hai richiesto tu questa operazione, ignora questa email.
      ========================================
    `);

    // TODO: Integrate with email provider
  }
}
