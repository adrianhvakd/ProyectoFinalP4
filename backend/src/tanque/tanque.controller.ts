import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TanqueService } from './tanque.service';
import { CreateTanqueDto } from './dto/create-tanque.dto';
import { UpdateTanqueDto } from './dto/update-tanque.dto';

@Controller('tanque')
export class TanqueController {
  constructor(private readonly tanqueService: TanqueService) {}

  @Post()
  create(@Body() createTanqueDto: CreateTanqueDto) {
    return this.tanqueService.create(createTanqueDto);
  }

  @Get()
  findAll() {
    return this.tanqueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tanqueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTanqueDto: UpdateTanqueDto) {
    return this.tanqueService.update(+id, updateTanqueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tanqueService.remove(+id);
  }
}
