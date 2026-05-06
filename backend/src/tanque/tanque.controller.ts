import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TanqueService } from './tanque.service';
import { CreateTanqueDto } from './dto/create-tanque.dto';
import { UpdateTanqueDto } from './dto/update-tanque.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('tanque')
export class TanqueController {
  constructor(private readonly tanqueService: TanqueService) {}

  @Get()
  findAll() {
    return this.tanqueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tanqueService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createTanqueDto: CreateTanqueDto) {
    return this.tanqueService.create(createTanqueDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTanqueDto: UpdateTanqueDto) {
    return this.tanqueService.update(id, updateTanqueDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tanqueService.remove(id);
  }
}
