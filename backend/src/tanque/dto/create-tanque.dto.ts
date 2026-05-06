import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateTanqueDto {
  @IsString()
  nombre: string;

  @IsEnum(['RESERVORIO_PUBLICO', 'DOMICILIARIO'])
  tipo: 'RESERVORIO_PUBLICO' | 'DOMICILIARIO';

  @IsNumber()
  capacidad_max: number;

  @IsNumber()
  altura_max: number;

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

export class UpdateTanqueDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsEnum(['RESERVORIO_PUBLICO', 'DOMICILIARIO'])
  @IsOptional()
  tipo?: 'RESERVORIO_PUBLICO' | 'DOMICILIARIO';

  @IsNumber()
  @IsOptional()
  capacidad_max?: number;

  @IsNumber()
  @IsOptional()
  altura_max?: number;

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