import { IsEmail, IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsIn(['ADMIN', 'USER'])
  role?: 'ADMIN' | 'USER';
}