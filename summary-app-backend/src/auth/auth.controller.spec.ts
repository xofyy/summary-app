import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockUsersService = {
    updateInterests: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    interests: ['teknoloji', 'bilim'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        interests: ['teknoloji'],
      };

      const expectedResult = {
        user: mockUser,
        access_token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: mockUser,
        access_token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginUserDto);

      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = { user: mockUser };

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual({
        id: mockUser._id.toString(),
        email: mockUser.email,
        interests: mockUser.interests,
      });
    });
  });

  describe('updateInterests', () => {
    it('should update user interests', async () => {
      const mockRequest = { user: mockUser };
      const updateInterestsDto = { interests: ['teknoloji', 'bilim', 'sanat'] };
      const updatedUser = { ...mockUser, interests: updateInterestsDto.interests };

      mockUsersService.updateInterests.mockResolvedValue(updatedUser);

      const result = await controller.updateInterests(mockRequest, updateInterestsDto);

      expect(usersService.updateInterests).toHaveBeenCalledWith(
        mockUser._id.toString(),
        updateInterestsDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });
});