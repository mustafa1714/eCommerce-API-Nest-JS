import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto, SignInDto, SignUpDto } from './dto/auth.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('reset-password')
  resetPassword(@Body() email: ResetPasswordDto) {
    return this.authService.resetPassword(email);
  }

  @Post('verify-code')
  verifyCode(
    @Body() { email, code }: { email: ResetPasswordDto; code: string },
  ) {
    return this.authService.verifyCode({ email, code }); // frontend developer responsable to send email from previous form but code is sent by user
  }

  @Post('change-password')
  changePassword(@Body() { email, password }: SignInDto) {
    return this.authService.changePassword({ email, password }); // frontend developer responsable to send email from previous form but password is sent by user
  }
}
