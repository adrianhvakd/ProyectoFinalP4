import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get('by-reservorio/:reservorioId')
  findByReservorio(@Param('reservorioId') reservorioId: string) {
    return this.sensorService.findByReservorio(reservorioId);
  }

  @Get('by-domiciliario/:domiciliarioId')
  findByDomiciliario(@Param('domiciliarioId') domiciliarioId: string) {
    return this.sensorService.findByDomiciliario(domiciliarioId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createSensorDto: CreateSensorDto) {
    return this.sensorService.create(createSensorDto);
  }

  @Get()
  findAll() {
    return this.sensorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSensorDto: UpdateSensorDto) {
    return this.sensorService.update(id, updateSensorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sensorService.remove(id);
  }
}