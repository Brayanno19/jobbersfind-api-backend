import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty({ message: 'L\'ID de l\'utilisateur signalé est requis' })
  @IsUUID('4', { message: 'L\'ID signalé doit être un UUID valide' })
  reportedId: string;

  @IsNotEmpty({ message: 'Le rôle de l\'utilisateur signalé est requis' })
  @IsIn(['CLIENT', 'ARTISAN'], { message: 'Le rôle de l\'utilisateur signalé doit être CLIENT ou ARTISAN' })
  reportedRole: string;

  @IsNotEmpty({ message: 'Le type de signalement est requis' })
  @IsIn(['FAKE_PROFILE', 'FRAUD', 'BAD_SERVICE', 'OTHER'], {
    message: 'Le type de signalement doit être FAKE_PROFILE, FRAUD, BAD_SERVICE ou OTHER',
  })
  type: string;

  @IsNotEmpty({ message: 'La description du signalement est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description: string;
}
