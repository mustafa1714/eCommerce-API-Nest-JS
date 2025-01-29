import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto, SignInDto, ResetPasswordDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
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

  async resetPassword({ email }: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) throw new NotFoundException('User not found');

    // generate code in 6 digits
    const code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    // update user with verification code in db
    await this.userModel.findOneAndUpdate(
      { email },
      { verificationCode: code },
    );

    // send email
    const htmlMessage = `<div>
      <h1>You are forgot your password</h1>
      <p>Use this code to reset your password: ${code}</p>
      <h3>Thank you, eCommerce-nestjs</h3>
    </div>`;
    await this.mailerService.sendMail({
      from: `eCommerce-nestjs< ${process.env.UsEMAIL_USERNAMEe} >`,
      to: email,
      subject: 'eCommerce-nestjs - Reset Password',
      html: htmlMessage,
    });
    return {
      status: 200,
      message: `Verification code sent to ${email}`,
    };
  }

  async verifyCode({ email, code }: { email: ResetPasswordDto; code: string }) {
    const user = await this.userModel
      .findOne({ email })
      .select('verificationCode');

    if (!user) throw new NotFoundException('User not found');

    if (user.verificationCode != code)
      throw new BadRequestException('Invalid code');

    await this.userModel.findOneAndUpdate(
      { email },
      { verificationCode: null },
    );
    return {
      status: 200,
      message: 'Code verified successfully, Go to set new password',
    };
  }

  async changePassword({ email, password }: SignInDto) {
    const salt = 10;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(password, salt);

    await this.userModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
    );

    return {
      status: 200,
      message:
        'Password changed successfully, Now You Can Sign In with New Password',
    };
  }
}
