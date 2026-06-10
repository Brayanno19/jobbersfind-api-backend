import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  /**
   * Envoie un OTP (One-Time Password) à un utilisateur.
   * Cette méthode effectue deux actions :
   * 1. Log dans la console pour permettre le test local même sans connexion Brevo.
   * 2. Tente l'envoi via SMTP Brevo.
   * 
   * @param to Email ou Numéro de téléphone cible
   * @param otp Le code OTP généré
   */
  async sendOtp(to: string, otp: string): Promise<void> {
    // 1. Log systématique dans la console (Méthode 1)
    this.logger.log(`=========================================`);
    this.logger.log(`[OTP CONSOLE] Action requise pour : ${to}`);
    this.logger.log(`[OTP CONSOLE] Votre code OTP est  : ${otp}`);
    this.logger.log(`=========================================`);

    // 2. Envoi via Brevo (Méthode 2)
    try {
      await this.sendViaBrevo(to, otp);
    } catch (error) {
      // On log l'erreur mais on ne crash pas l'app, le code étant dispo en console
      this.logger.error(`Erreur lors de l'envoi de l'OTP via Brevo à ${to} : ${error.message}`);
    }
  }

  /**
   * Fonction interne simulant ou gérant l'envoi réel via Brevo
   */
  private async sendViaBrevo(to: string, otp: string): Promise<void> {
    // TODO: Intégrer nodemailer configuré avec les identifiants SMTP de Brevo
    // Ceci est la préparation de la méthode.
    this.logger.debug(`[BREVO SMTP] Tentative d'envoi réseau de l'email contenant l'OTP à ${to}...`);
    // throw new Error("Brevo non configuré"); // Décommenter pour tester le fallback
  }
}
