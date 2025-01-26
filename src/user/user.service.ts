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
      message: 'User created successfully',
      data: createdUser,
      status: 201,
    };
  }

  /**
   * @docs Get all users - For Admin
   * @method GET - http://localhost:3000/api/v1/user
   * @returns All users
   * @access Private
   */
  async findAll(): Promise<{
    data: User[];
    status: number;
  }> {
    const users = await this.userModel.find().select('-password -__v');
    return {
      data: users,
      status: 200,
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
      data: user,
      status: 200,
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
      message: 'User updated successfully',
      data: updatedUser,
      status: 201,
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
      message: 'User deleted successfully',
      status: 200,
    };
  }
}
