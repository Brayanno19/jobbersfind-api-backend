import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialisation du transporter Nodemailer avec la configuration Brevo
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('BREVO_SMTP_HOST') || 'smtp-relay.brevo.com',
      port: parseInt(this.configService.get<string>('BREVO_SMTP_PORT') || '587', 10),
      secure: false, // true pour le port 465, false pour les autres (STARTTLS)
      auth: {
        user: this.configService.get<string>('BREVO_SMTP_USER'),
        pass: this.configService.get<string>('BREVO_SMTP_PASSWORD'),
      },
    });
  }

  /**
   * Envoie un OTP (One-Time Password) à un utilisateur.
   * Cette méthode effectue deux actions :
   * 1. Log dans la console pour permettre le test local même sans connexion Brevo.
   * 2. Tente l'envoi via SMTP Brevo.
   * 
   * @param to Email cible (ou numéro si on implémente le SMS plus tard)
   * @param otp Le code OTP généré
   */
  async sendOtp(to: string, otp: string): Promise<void> {
    // 1. Log systématique dans la console (Méthode de fallback pour dev)
    this.logger.log(`=========================================`);
    this.logger.log(`[OTP CONSOLE] Action requise pour : ${to}`);
    this.logger.log(`[OTP CONSOLE] Votre code OTP est  : ${otp}`);
    this.logger.log(`=========================================`);

    // 2. Envoi via Brevo si l'utilisateur a configuré ses clés
    const smtpUser = this.configService.get<string>('BREVO_SMTP_USER');
    const smtpPass = this.configService.get<string>('BREVO_SMTP_PASSWORD');

    if (smtpUser && smtpPass && smtpPass !== 'votre_mot_de_passe_ou_cle_smtp') {
      try {
        await this.sendViaBrevo(to, otp);
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'OTP via Brevo à ${to} : ${error.message}`);
      }
    } else {
      this.logger.warn(`[BREVO SMTP] Envoi ignoré : Les identifiants SMTP Brevo ne sont pas configurés dans le fichier .env.`);
    }
  }

  /**
   * Fonction interne gérant l'envoi réel via Brevo avec Nodemailer
   */
  private async sendViaBrevo(to: string, otp: string): Promise<void> {
    this.logger.debug(`[BREVO SMTP] Tentative d'envoi réseau de l'email contenant l'OTP à ${to}...`);
    
    const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL') || 'noreply@jobbersfind.com';
    const senderName = this.configService.get<string>('BREVO_SENDER_NAME') || 'JobbersFind';

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: to,
      subject: 'Code de vérification - JobbersFind',
      text: `Bonjour,\n\nVotre code de vérification est : ${otp}\n\nCe code est valide pendant 15 minutes.\n\nCordialement,\nL'équipe JobbersFind.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #FF8C00; text-align: center;">JobbersFind</h2>
          <p style="font-size: 16px; color: #333;">Bonjour,</p>
          <p style="font-size: 16px; color: #333;">Merci de vous être inscrit sur JobbersFind. Veuillez utiliser le code de vérification suivant pour valider votre compte :</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #006B5A; background-color: #f4f4f4; padding: 10px 20px; border-radius: 5px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">Ce code est valide pendant 15 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">L'équipe JobbersFind</p>
        </div>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);
    this.logger.debug(`[BREVO SMTP] Email envoyé avec succès : ${info.messageId}`);
  }
}

