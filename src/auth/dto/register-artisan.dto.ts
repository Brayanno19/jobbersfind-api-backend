import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, IsArray, ArrayMaxSize, ArrayMinSize } from 'class-validator';

/**
 * DTO pour l'inscription d'un Artisan (Supporte le mode Simple et Complet)
 */
export class RegisterArtisanDto {
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Le nom de famille est requis' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  companyName?: string;

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

  // --- Champs Mode Simple (Recommandés) ---
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  // --- Champs Mode Complet ---
  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Un artisan doit choisir au moins 1 métier' })
  @ArrayMaxSize(4, { message: 'Un artisan peut avoir au maximum 4 métiers' })
  domainIds?: string[];
}
