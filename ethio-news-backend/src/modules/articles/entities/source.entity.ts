import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Article } from './article.entity';
import { Language, Type } from './language.enum';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string; // e.g., "Addis Standard", "VOA Amharic"

  @Column({ type: 'varchar', unique: true })
  rssUrl!: string;

  @Column({ type: 'enum', enum: Language, default: Language.ENGLISH })
  language!: Language;

  @Column({ type: 'enum', enum: Type })
  type!: Type;

  @Column({ type: 'int', default: 0 })
  failureCount!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Article, (article) => article.source)
  articles!: Article[];

  @CreateDateColumn()
  createdAt!: Date;
}
