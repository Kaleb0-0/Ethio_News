import { Column, Entity, PrimaryColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';
import { PreferedLanguage } from './prefered-language.enum';

@Entity()
export class User {
  @PrimaryColumn()
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  salt!: string;

  @Column()
  password!: string;

  async checkPassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  @Column()
  role!: UserRole;

  @Column({ default: PreferedLanguage.ENG })
  preferedLanguage!: PreferedLanguage;
}
