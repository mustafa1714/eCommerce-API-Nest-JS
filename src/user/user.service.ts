import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * @docs Create user - For Admin
   * @method POST - http://localhost:3000/api/v1/user
   * @param createUserDto
   * @returns  Created user
   * @access Private
   */
  async create(createUserDto: CreateUserDto): Promise<{
    data: User;
    message: string;
    status: number;
  }> {
    // check if user exist
    const user = await this.userModel.findOne({ email: createUserDto.email });
    if (user) throw new BadRequestException('User already exist');

    // hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // create user
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role ?? 'user',
    });

    // save user
    await createdUser.save();
    return {
      status: 201,
      message: 'User created successfully',
      data: createdUser,
    };
  }

  /**
   * @docs Get all users - For Admin
   * @method GET - http://localhost:3000/api/v1/user
   * @returns All users
   * @access Private
   */
  async findAll(query): Promise<{
    length: number;
    data: User[];
    status: number;
  }> {
    const {
      limit = 1000_00_00,
      skip = 0,
      sort = 'asc',
      name,
      email,
      role,
    } = query;

    if (Number.isNaN(+limit))
      throw new BadRequestException('Limit must be a number');

    if (Number.isNaN(+skip))
      throw new BadRequestException('Skip must be a number');

    if (!['asc', 'desc'].includes(sort))
      throw new BadRequestException('Sort must be asc or desc');

    const users = await this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .where({ name: new RegExp(name, 'i') })
      .where({ email: new RegExp(email, 'i') })
      .where({ role: new RegExp(role, 'i') })
      .sort({ name: sort })
      .select('-password -__v');
    return {
      status: 200,
      length: users.length,
      data: users,
    };
  }

  /**
   * @docs Get user by id - For Admin
   * @method GET - http://localhost:3000/api/v1/user/:id
   * @param id
   * @returns User
   * @access Private
   */
  async findOne(id: string): Promise<{ data: User; status: number }> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) throw new NotFoundException('User not found');
    return {
      status: 200,
      data: user,
    };
  }

  /**
   * @docs Update user by id - For Admin
   * @method PATCH - http://localhost:3000/api/v1/user/:id
   * @param id
   * @body updateUserDto
   * @returns Updated user
   * @access Private
   */

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    data: User;
    status: number;
  }> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );

    return {
      status: 201,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  /**
   * @docs Delete user by id - For Admin
   * @method DELETE - http://localhost:3000/api/v1/user/:id
   * @param id
   * @returns Deleted user
   * @access Private
   */
  async remove(id: string): Promise<{ message: string; status: number }> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    await this.userModel.findByIdAndDelete(id);
    return {
      status: 200,
      message: 'User deleted successfully',
    };
  }

  /**
   * Get user profile
   * @method GET - http://localhost:3000/api/v1/profile
   * @param payload
   * @returns user
   * @access Private [user self, admin]
   */
  async getProfile(payload) {
    if (!payload.id) throw new NotFoundException('User not found');
    const user = await this.userModel
      .findById(payload.id)
      .select('-password -__v');

    if (!user) throw new NotFoundException('User not found');
    return {
      status: 200,
      data: user,
    };
  }

  /**
   * Update user profile
   * @method PATCH - http://localhost:3000/api/v1/profile
   * @param payload
   * @param updateUserDto
   * @returns updated user
   * @access Private [user self, admin]
   */
  async updateProfile(payload, updateUserDto: UpdateUserDto) {
    if (!payload.id) throw new NotFoundException('User not found');

    const user = await this.userModel.findById(payload.id);
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(payload.id, updateUserDto, { new: true })
      .select('-password -__v');
    return {
      status: 201,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async deleteProfile(payload) {
    if (!payload.id) throw new NotFoundException('User not found');
    const user = await this.userModel.findById(payload.id);
    if (!user) throw new NotFoundException('User not found');
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        payload.id,
        {
          active: false,
        },
        { new: true },
      )
      .select('-password -__v');

    return {
      status: 200,
      message: 'Your account has been deleted successfully',
      data: updatedUser,
    };
  }
}
