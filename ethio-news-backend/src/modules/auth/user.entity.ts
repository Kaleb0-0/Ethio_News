import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';
import { PreferedLanguage } from './prefered-language.enum';
import { PushSubscription } from './push-subscription.entity';

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

  @Column({ default: true })
  notificationsEnabled!: boolean;

  @OneToMany(() => PushSubscription, (sub) => sub.user)
  pushSubscriptions!: PushSubscription[];

  @Column()
  role!: UserRole;

  @Column({ default: PreferedLanguage.ENG })
  preferedLanguage!: PreferedLanguage;
}
