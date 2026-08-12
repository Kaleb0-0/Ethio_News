import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInCredentialsDto, SignUpCredentialsDto } from './auth.model';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';
import { JwtPayload } from './jwt.interface';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { PreferedLanguage } from './prefered-language.enum';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private userRole = UserRole;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PushSubscription)
    private pushRepository: Repository<PushSubscription>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpCredentialsDto: SignUpCredentialsDto): Promise<void> {
    let { username, email, password } = signUpCredentialsDto;

    //check if username exist and if not create a username
    if (!username) {
      let unique = false;
      while (!unique) {
        username = 'user' + Math.random().toString(36).substring(2, 10);
        let exists = await this.userRepository.findOne({ where: { username } });
        if (!exists) unique = true;
      }
    }
    const user = new User();
    user.username = username;
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.role = this.userRole.NORMAL;

    try {
      await this.userRepository.save(user);
    } catch (error: any) {
      //log error
      if (error?.code === '23505') {
        const detail = error.detail || '';

        if (detail.includes('username')) {
          this.logger.error(`Username is already registered`);
          throw new ConflictException('Username is already taken');
        }

        if (detail.includes('email')) {
          this.logger.error(`Email is already registered`);
          throw new ConflictException('Email is already registered');
        }
        this.logger.error(`Account details already exists`);
        throw new ConflictException('Account details already exist');
      }

      throw new InternalServerErrorException();
    }
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async signIn(
    signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = signInCredentialsDto;
    let user: User | null = null;

    user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await user.checkPassword(password))) {
      throw new UnauthorizedException('Invalid credientials');
    }

    const payload: JwtPayload = { email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );
    return { accessToken };
  }

  async changeLanguage(lang: PreferedLanguage, user: User): Promise<void> {
    user.preferedLanguage = lang;
    await this.userRepository.update(user.username, { preferedLanguage: lang });
  }

  async findByEmail(email: string) {
    const user = this.userRepository.findOne({ where: { email } });
    return user;
  }

  async getLang(token: any) {
    const decoded = await this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    const user = await this.findByEmail(decoded.email);
    return user?.preferedLanguage;
  }

  async toggleNotifications(
    user: User,
  ): Promise<{ notificationsEnabled: boolean }> {
    const newValue = !user.notificationsEnabled;
    await this.userRepository.update(user.username, {
      notificationsEnabled: newValue,
    });
    return { notificationsEnabled: newValue };
  }

  onModuleInit() {
    webpush.setVapidDetails(
      this.configService.getOrThrow('VAPID_EMAIL'),
      this.configService.getOrThrow('VAPID_PUBLIC_KEY'),
      this.configService.getOrThrow('VAPID_PRIVATE_KEY'),
    );
  }

  async savePushSubscription(
    user: User,
    sub: { endpoint: string; p256dh: string; auth: string },
  ): Promise<void> {
    await this.pushRepository.upsert(
      { ...sub, username: user.username, user },
      { conflictPaths: ['endpoint'] },
    );
  }

  async sendPushToAll(title: string, body: string): Promise<void> {
    const subscriptions = await this.pushRepository.find({
      where: { user: { notificationsEnabled: true } },
      relations: { user: true },
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ title, body }),
        );
      } catch {
        // subscription expired — delete it
        await this.pushRepository.delete(sub.id);
      }
    }
  }
}
