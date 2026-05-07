import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DispositivoEsp32Service } from './dispositivo-esp32.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('dispositivo-esp32')
export class DispositivoEsp32Controller {
  constructor(private readonly service: DispositivoEsp32Service) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('by-reservorio/:reservorioId')
  findByReservorio(@Param('reservorioId') reservorioId: string) {
    return this.service.findByReservorio(reservorioId);
  }

  @Get('by-domiciliario/:domiciliarioId')
  findByDomiciliario(@Param('domiciliarioId') domiciliarioId: string) {
    return this.service.findByDomiciliario(domiciliarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createDto: { nombre: string; reservorioId?: string; domiciliarioId?: string }) {
    return this.service.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: { nombre?: string; estado?: string }) {
    return this.service.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/regenerate-key')
  regenerateApiKey(@Param('id') id: string) {
    return this.service.regenerateApiKey(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}