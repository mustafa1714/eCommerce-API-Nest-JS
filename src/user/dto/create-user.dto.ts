import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(30, { message: 'Name must be at most 30 characters' })
  name: string;

  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(['admin', 'user'], { message: 'Role must be admin or user' })
  @IsNotEmpty({ message: 'Role is required' })
  role: string;

  @IsString({ message: 'Avatar must be a string' })
  @IsUrl({}, { message: 'Avatar is not valid Url' })
  @IsOptional()
  avatar: string;

  @IsNumber({}, { message: 'Age must be a number' })
  @IsOptional()
  age: number;

  @IsString()
  @MinLength(11, { message: 'Phone must be at least 11 characters' })
  @IsPhoneNumber('EG', { message: 'Phone is not valid' }) // make validate on phone number on specific country
  @IsOptional()
  phone: number;

  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address: string;

  @IsBoolean({ message: 'Active must be a boolean' })
  @IsOptional()
  @IsEnum([true, false], { message: 'Active must be true or false' })
  active: boolean;

  @IsString({ message: 'VerificationCode must be a string' })
  @Length(6, 6, { message: 'VerificationCode must be 6 characters' })
  @IsOptional()
  verificationCode: string;

  @IsEnum(['male', 'female'], { message: 'Gender must be male or female' })
  @IsOptional()
  gender: string;
}
