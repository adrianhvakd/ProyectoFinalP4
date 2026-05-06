import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { IsUUID } from 'class-validator';

export class CreateMedicionDto {
  @IsUUID()
  @IsNotEmpty()
  sensorId: string;

  @IsNumber()
  @IsNotEmpty()
  valor: number;
}

export class UpdateMedicionDto {
  @IsNumber()
  @IsOptional()
  valor?: number;
}