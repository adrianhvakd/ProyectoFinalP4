import { PartialType } from '@nestjs/mapped-types';
import { CreateTanqueDto } from './create-tanque.dto';

export class UpdateTanqueDto extends PartialType(CreateTanqueDto) {}
