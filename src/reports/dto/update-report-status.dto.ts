import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateReportStatusDto {
  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsIn(['RESOLVED', 'DISMISSED'], { message: 'Le statut doit être RESOLVED ou DISMISSED' })
  status: string;
}
