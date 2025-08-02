import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { User } from '../users/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    interests: string[];
  };
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(createUserDto);
    return this.generateAuthResponse(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginUserDto.email);

    if (!user || !(await this.usersService.validatePassword(loginUserDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }

  private generateAuthResponse(user: any): AuthResponse {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        interests: user.interests || [],
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}