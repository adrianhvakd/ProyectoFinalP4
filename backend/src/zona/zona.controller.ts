import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('zona')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Get('geojson')
  async findAllGeoJSON() {
    return this.zonaService.findAllGeoJSON();
  }

  @Get('by-reservorio/:id')
  async getZonaByReservorio(@Param('id') id: string) {
    return this.zonaService.getZonaByReservorio(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createZonaDto: CreateZonaDto) {
    return this.zonaService.create(createZonaDto);
  }

  @Get()
  findAll() {
    return this.zonaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZonaDto: UpdateZonaDto) {
    return this.zonaService.update(id, updateZonaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonaService.remove(id);
  }
}