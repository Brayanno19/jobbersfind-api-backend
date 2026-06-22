import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'L\'identifiant (email ou téléphone) est requis' })
  @IsString()
  identifier: string;

  @IsNotEmpty({ message: 'L\'OTP est requis' })
  @IsString()
  otp: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  newPassword: string;
}
