import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO pour la connexion de tous les utilisateurs
 * L'identifiant peut être un email ou un numéro de téléphone
 */
export class LoginDto {
  @IsNotEmpty({ message: "L'identifiant (email ou téléphone) est requis" })
  @IsString()
  identifier: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}
