import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    MongooseModule.forRoot('mongodb://localhost:27017/eCommerceAPI'),
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' }, // expires in 60 seconds by buisness logic
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
