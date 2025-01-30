import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 30, { message: 'Name must be between 3 and 30 characters' })
  name: string;

  @IsString({ message: 'Image must be a string' })
  @IsUrl({}, { message: 'Image is not valid Url' })
  @IsOptional()
  image: string;
}

