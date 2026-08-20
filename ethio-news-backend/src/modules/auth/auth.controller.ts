import {
  Body,
  Controller,
  Get,
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
import { PreferedLanguage } from './prefered-language.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signUp')
  signUp(
    @Body(ValidationPipe) signUpCredentialsDto: SignUpCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signUp(signUpCredentialsDto);
  }

  @Post('/signIn')
  signIn(
    @Body(ValidationPipe) signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInCredentialsDto);
  }

  @Patch('notifications')
  @UseGuards(AuthGuard())
  async toggleNotifications(@GetUser() user: User) {
    return this.authService.toggleNotifications(user);
  }

  @Get('me')
  @UseGuards(AuthGuard())
  async getMe(@GetUser() user: User) {
    return {
      email: user.email,
      username: user.username,
      preferedLanguage: user.preferedLanguage,
      notificationsEnabled: user.notificationsEnabled,
    };
  }

  @Post('push-subscription')
  @UseGuards(AuthGuard())
  async savePushSubscription(
    @GetUser() user: User,
    @Body() body: { endpoint: string; p256dh: string; auth: string },
  ) {
    await this.authService.savePushSubscription(user, body);
    return { success: true };
  }

  @Patch(':lang')
  @UseGuards(AuthGuard())
  changeLanguage(
    @Param('lang', new ParseEnumPipe(PreferedLanguage)) lang: PreferedLanguage,
    @GetUser() user: User,
  ) {
    return this.authService.changeLanguage(lang, user);
  }
}
