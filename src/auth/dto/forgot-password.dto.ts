import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'L\'identifiant (email ou téléphone) est requis' })
  @IsString()
  identifier: string;
}
