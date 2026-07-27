import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class SignUpCredentialsDto {
  @ValidateIf((o) => !o.email)
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username!: string;

  @IsEmail()
  @MinLength(6)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W))(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password!: string;
}

export class SignInCredentialsDto {
  @IsEmail()
  @MinLength(6)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W))(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password!: string;
}
