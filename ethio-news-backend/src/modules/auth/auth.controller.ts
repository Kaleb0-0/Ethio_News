import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInCredentialsDto, SignUpCredentialsDto } from './auth.model';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { GetUser } from './get-user.decorator';
import { Language } from './language.enum';

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

  @Patch(':lang')
  @UseGuards(AuthGuard())
  changeLanguage(
    @Param('lang', new ParseEnumPipe(Language)) lang: Language,
    @GetUser() user: User,
  ) {
    return this.authService.changeLanguage(lang, user);
  }
}
