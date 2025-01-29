import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const salt = 10;
    // check if user exist
    const user = await this.userModel.findOne({ email: signUpDto.email });
    if (user) throw new BadRequestException('User already exist');

    // hashing password
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    const newUser = {
      password: hashedPassword,
      active: true,
      role: 'user',
    };

    // create user
    const createdUser = await this.userModel.create({
      ...signUpDto,
      ...newUser,
    });

    // generate token
    const payload = {
      id: createdUser._id,
      email: createdUser.email,
      role: createdUser.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    return {
      status: 201,
      message: 'You Signed Up Successfully',
      data: createdUser,
      accessToken,
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userModel.findOne({ email: signInDto.email });
    if (!user) throw new NotFoundException('Invalid email or password');

    const isMatch = await bcrypt.compare(signInDto.password, user.password);
    if (!isMatch) throw new NotFoundException('Invalid email or password');

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    return {
      status: 200,
      message: 'You Signed In Successfully',
      data: user,
      accessToken,
    };
  }
}
