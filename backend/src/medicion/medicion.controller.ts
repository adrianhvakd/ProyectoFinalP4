import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicionService } from './medicion.service';
import { CreateMedicionDto } from './dto/create-medicion.dto';
import { UpdateMedicionDto } from './dto/update-medicion.dto';

@Controller('medicion')
export class MedicionController {
  constructor(private readonly medicionService: MedicionService) {}

  @Post()
  create(@Body() createMedicionDto: CreateMedicionDto) {
    return this.medicionService.create(createMedicionDto);
  }

  @Get()
  findAll() {
    return this.medicionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicionDto: UpdateMedicionDto) {
    return this.medicionService.update(+id, updateMedicionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicionService.remove(+id);
  }
}
