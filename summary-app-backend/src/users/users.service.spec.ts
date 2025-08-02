import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateInterestsDto } from './dto/update-interests.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    interests: ['teknoloji'],
    save: jest.fn(),
  };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
      new: jest.fn().mockImplementation((userData) => ({
        ...userData,
        save: jest.fn().mockResolvedValue({ ...userData, _id: 'user123' }),
      })),
    };

    // Mock constructor
    mockUserModel.mockImplementation((userData) => ({
      ...userData,
      save: jest.fn().mockResolvedValue({ ...userData, _id: 'user123' }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        interests: ['teknoloji'],
      };

      mockUserModel.findOne.mockResolvedValue(null);
      
      const userInstance = {
        ...createUserDto,
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          ...createUserDto,
          password: 'hashedPassword',
        }),
      };
      
      mockUserModel.mockReturnValue(userInstance);

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const execMock = jest.fn().mockResolvedValue(mockUser);
      
      mockUserModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = 'user123';
      const execMock = jest.fn().mockResolvedValue(mockUser);
      
      mockUserModel.findById.mockReturnValue({ 
        select: jest.fn().mockReturnValue({ exec: execMock }) 
      });

      const result = await service.findById(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateInterests', () => {
    it('should update user interests', async () => {
      const userId = 'user123';
      const updateInterestsDto: UpdateInterestsDto = {
        interests: ['teknoloji', 'bilim'],
      };
      
      const updatedUser = { ...mockUser, interests: updateInterestsDto.interests };
      
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.updateInterests(userId, updateInterestsDto);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { interests: updateInterestsDto.interests },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonexistent';
      const updateInterestsDto: UpdateInterestsDto = {
        interests: ['teknoloji'],
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateInterests(userId, updateInterestsDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validatePassword', () => {
    it('should validate password correctly', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword';

      // bcrypt.compare'ın mock'u
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });
  });
});