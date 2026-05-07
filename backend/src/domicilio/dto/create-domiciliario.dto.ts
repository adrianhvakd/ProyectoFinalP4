import { IsString, IsNumber, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateDomiciliarioDto {
  @IsString()
  nombre: string;

  @IsNumber()
  capacidad_max: number;

  @IsNumber()
  altura_max: number;

  @IsUUID()
  @IsOptional()
  reservorioId?: string;

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

export class UpdateDomiciliarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsNumber()
  @IsOptional()
  capacidad_max?: number;

  @IsNumber()
  @IsOptional()
  altura_max?: number;

  @IsUUID()
  @IsOptional()
  reservorioId?: string;

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