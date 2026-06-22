import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'L\'identifiant (téléphone ou email) est requis' })
  @IsString()
  identifier: string;

  @IsNotEmpty({ message: 'Le code OTP est requis' })
  @IsString()
  @Length(6, 6, { message: 'Le code OTP doit faire exactement 6 caractères' })
  otp: string;
}

export class ResendOtpDto {
  @IsNotEmpty({ message: 'L\'identifiant (téléphone ou email) est requis' })
  @IsString()
  identifier: string;
}
