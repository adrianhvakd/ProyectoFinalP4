import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateSensorDto {
  @IsEnum(['NIVEL', 'PH', 'TURBIDEZ', 'TEMPERATURA', 'FLUJO'])
  tipo: 'NIVEL' | 'PH' | 'TURBIDEZ' | 'TEMPERATURA' | 'FLUJO';

  @IsString()
  unidad_medida: string;

  @IsUUID()
  @IsOptional()
  tanqueId?: string;

  @IsUUID()
  @IsOptional()
  dispositivoId?: string;
}

export class UpdateSensorDto {
  @IsEnum(['NIVEL', 'PH', 'TURBIDEZ', 'TEMPERATURA', 'FLUJO'])
  @IsOptional()
  tipo?: 'NIVEL' | 'PH' | 'TURBIDEZ' | 'TEMPERATURA' | 'FLUJO';

  @IsString()
  @IsOptional()
  unidad_medida?: string;

  @IsUUID()
  @IsOptional()
  dispositivoId?: string;
}