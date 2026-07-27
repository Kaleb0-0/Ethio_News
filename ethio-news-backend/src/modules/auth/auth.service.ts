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

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private userRole = UserRole;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
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

    if (!user || !user.checkPassword(password)) {
      throw new UnauthorizedException('Invalid credientials');
    }

    const payload: JwtPayload = { email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );
    return { accessToken };
  }
}
