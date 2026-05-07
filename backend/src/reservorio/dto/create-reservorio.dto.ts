import { IsString, IsNumber, IsOptional, IsUUID, IsObject, IsIn } from 'class-validator';

export class CreateReservorioDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsIn(['RESERVORIO_PUBLICO', 'DOMICILIARIO'])
  tipo?: 'RESERVORIO_PUBLICO' | 'DOMICILIARIO';

  @IsNumber()
  capacidad_max: number;

  @IsNumber()
  altura_max: number;

  @IsNumber()
  @IsOptional()
  radio_cobertura?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsObject()
  @IsOptional()
  ubicacion?: { type: string; coordinates: number[] };

  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class UpdateReservorioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsNumber()
  @IsOptional()
  capacidad_max?: number;

  @IsNumber()
  @IsOptional()
  altura_max?: number;

  @IsNumber()
  @IsOptional()
  radio_cobertura?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsObject()
  @IsOptional()
  ubicacion?: { type: string; coordinates: number[] };
}