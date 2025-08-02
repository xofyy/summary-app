import { Controller, Post, Body, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UpdateInterestsDto } from '../users/dto/update-interests.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      id: req.user._id.toString(),
      email: req.user.email,
      interests: req.user.interests || [],
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('interests')
  async updateInterests(
    @Request() req,
    @Body() updateInterestsDto: UpdateInterestsDto,
  ) {
    return this.usersService.updateInterests(req.user._id.toString(), updateInterestsDto);
  }
}