import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DispositivoEsp32Service } from './dispositivo-esp32.service';
import { CreateDispositivoEsp32Dto } from './dto/create-dispositivo-esp32.dto';
import { UpdateDispositivoEsp32Dto } from './dto/update-dispositivo-esp32.dto';

@Controller('dispositivo-esp32')
export class DispositivoEsp32Controller {
  constructor(private readonly dispositivoEsp32Service: DispositivoEsp32Service) {}

  @Post()
  create(@Body() createDispositivoEsp32Dto: CreateDispositivoEsp32Dto) {
    return this.dispositivoEsp32Service.create(createDispositivoEsp32Dto);
  }

  @Get()
  findAll() {
    return this.dispositivoEsp32Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispositivoEsp32Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDispositivoEsp32Dto: UpdateDispositivoEsp32Dto) {
    return this.dispositivoEsp32Service.update(+id, updateDispositivoEsp32Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispositivoEsp32Service.remove(+id);
  }
}
