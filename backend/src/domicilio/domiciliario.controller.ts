import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DomiciliarioService } from './domiciliario.service';
import { CreateDomiciliarioDto } from './dto/create-domiciliario.dto';
import { UpdateDomiciliarioDto } from './dto/create-domiciliario.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('domiciliario')
export class DomiciliarioController {
  constructor(private readonly domiciliarioService: DomiciliarioService) {}

  @Get()
  findAll() {
    return this.domiciliarioService.findAll();
  }

  @Get('by-reservorio/:reservorioId')
  findByReservorio(@Param('reservorioId') reservorioId: string) {
    return this.domiciliarioService.findByReservorio(reservorioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domiciliarioService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createDomiciliarioDto: CreateDomiciliarioDto) {
    return this.domiciliarioService.create(createDomiciliarioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDomiciliarioDto: UpdateDomiciliarioDto) {
    return this.domiciliarioService.update(id, updateDomiciliarioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.domiciliarioService.remove(id);
  }
}