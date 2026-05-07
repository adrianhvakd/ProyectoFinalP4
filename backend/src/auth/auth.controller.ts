import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(loginDto, res);
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(res);
    return result;
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Req() req: Request) {
    const user = (req as any).user;
    return this.authService.validateUser(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profile')
  @Roles('ADMIN', 'USER')
  async profile(@Req() req: Request) {
    const user = (req as any).user;
    return this.authService.validateUser(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin-only')
  @Roles('ADMIN')
  adminOnly(@Req() req: Request) {
    return { message: 'Solo ADMIN puede ver esto', user: (req as any).user };
  }
}