import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInCredentialsDto, SignUpCredentialsDto } from './auth.model';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signUp')
  signUp(
    @Body(ValidationPipe) signUpCredentialsDto: SignUpCredentialsDto,
  ): Promise<void> {
    return this.authService.signUp(signUpCredentialsDto);
  }

  @Post('/signIn')
  signIn(
    @Body(ValidationPipe) signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInCredentialsDto);
  }
}
