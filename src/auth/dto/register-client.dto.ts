import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO pour l'inscription d'un Client
 */
export class RegisterClientDto {
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsNotEmpty({ message: 'Le numéro de téléphone est requis pour valider le compte' })
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsEmail({}, { message: 'L\'email doit être valide' })
  email?: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}
