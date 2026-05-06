import { PartialType } from '@nestjs/mapped-types';
import { CreateCaneriaDto } from './create-caneria.dto';

export class UpdateCaneriaDto extends PartialType(CreateCaneriaDto) {}
