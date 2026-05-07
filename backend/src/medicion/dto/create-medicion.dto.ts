import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateMedicionDto {
  @IsUUID()
  @IsNotEmpty()
  sensorId?: string;

  @IsNumber()
  @IsNotEmpty()
  valor?: number;

  @IsString()
  @IsNotEmpty()
  apiKey?: string;
}

export class UpdateMedicionDto {
  @IsNumber()
  @IsOptional()
  valor?: number;
}
