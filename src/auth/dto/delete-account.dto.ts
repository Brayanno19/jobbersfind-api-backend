import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis pour supprimer le compte' })
  password: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
