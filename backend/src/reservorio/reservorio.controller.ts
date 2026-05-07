import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReservorioService } from './reservorio.service';
import { CreateReservorioDto } from './dto/create-reservorio.dto';
import { UpdateReservorioDto } from './dto/create-reservorio.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('reservorio')
export class ReservorioController {
  constructor(private readonly reservorioService: ReservorioService) {}

  @Get()
  findAll() {
    return this.reservorioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservorioService.findOne(id);
  }

  @Get(':id/radio-minimo')
  getRadioMinimo(@Param('id') id: string) {
    return this.reservorioService.getRadioMinimo(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createReservorioDto: CreateReservorioDto) {
    return this.reservorioService.create(createReservorioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReservorioDto: UpdateReservorioDto) {
    return this.reservorioService.update(id, updateReservorioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservorioService.remove(id);
  }
}