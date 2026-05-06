import { PartialType } from '@nestjs/mapped-types';
import { CreateDispositivoEsp32Dto } from './create-dispositivo-esp32.dto';

export class UpdateDispositivoEsp32Dto extends PartialType(CreateDispositivoEsp32Dto) {}
