import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [30, 'Name must be at most 30 characters'],
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    minlength: [6, 'Name must be at least 3 characters'],
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    enum: ['admin', 'user'],
  })
  role: string;

  @Prop({
    type: String,
  })
  avatar: string;

  @Prop({
    type: Number,
  })
  age: number;

  @Prop({
    type: Number,
    length: [11, 'Phone must be at least 11 characters as EG Standerd'],
  })
  phone: number;

  @Prop({
    type: String,
  })
  address: string;

  @Prop({
    type: Boolean,
    enum: [true, false],
  })
  active: boolean;

  @Prop({
    type: String,
  })
  verificationCode: string;

  @Prop({
    type: String,
    enum: ['male', 'female'],
  })
  gender: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
