import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CaneriaService } from './caneria.service';
import { CreateCaneriaDto } from './dto/create-caneria.dto';
import { UpdateCaneriaDto } from './dto/update-caneria.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('caneria')
export class CaneriaController {
  constructor(private readonly caneriaService: CaneriaService) {}

  @Get('geojson')
  async findAllGeoJSON() {
    return this.caneriaService.findAllGeoJSON();
  }

  @Get('by-tanque/:id')
  async findByTanqueId(@Param('id') id: string) {
    return this.caneriaService.findByTanqueId(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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
    return this.caneriaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaneriaDto: UpdateCaneriaDto) {
    return this.caneriaService.update(id, updateCaneriaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caneriaService.remove(id);
  }
}