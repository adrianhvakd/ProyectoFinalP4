import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaneriaService } from './caneria.service';
import { CreateCaneriaDto } from './dto/create-caneria.dto';
import { UpdateCaneriaDto } from './dto/update-caneria.dto';

@Controller('caneria')
export class CaneriaController {
  constructor(private readonly caneriaService: CaneriaService) {}

  @Post()
  create(@Body() createCaneriaDto: CreateCaneriaDto) {
    return this.caneriaService.create(createCaneriaDto);
  }

  @Get()
  findAll() {
    return this.caneriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caneriaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaneriaDto: UpdateCaneriaDto) {
    return this.caneriaService.update(+id, updateCaneriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caneriaService.remove(+id);
  }
}
