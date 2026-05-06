import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MedicionService } from './medicion.service';
import { CreateMedicionDto } from './dto/create-medicion.dto';
import { UpdateMedicionDto } from './dto/update-medicion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('medicion')
export class MedicionController {
  constructor(private readonly medicionService: MedicionService) {}

  @Get('sensor/:sensorId')
  async findBySensorId(@Param('sensorId') sensorId: string) {
    return this.medicionService.findBySensorId(sensorId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicionDto: UpdateMedicionDto) {
    return this.medicionService.update(+id, updateMedicionDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicionService.remove(+id);
  }
}