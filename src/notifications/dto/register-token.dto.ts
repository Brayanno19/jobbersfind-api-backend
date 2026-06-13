import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterTokenDto {
  @IsNotEmpty({ message: 'Le jeton FCM est requis' })
  @IsString({ message: 'Le jeton FCM doit être une chaîne de caractères' })
  fcmToken: string;
}
