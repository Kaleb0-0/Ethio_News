import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Source } from './source.entity';
import { Language } from './language.enum';

export enum ArticleStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  sourceUrl!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  urlHash!: string;

  @Column({ type: 'text', nullable: true })
  rawContent!: string;

  @Column({ type: 'timestamp' })
  pubDate!: Date;

  @Column({ type: 'enum', enum: Language, default: Language.ENGLISH })
  language!: Language;

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.PENDING })
  status!: ArticleStatus;

  // --- Summary fields (filled after Ai processes the article) ---

  @Column({ type: 'varchar', length: 500, nullable: true })
  headline!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  headlineAmharic!: string;

  @Column({ type: 'text', array: true, nullable: true })
  summary!: string[];

  @Column({ type: 'text', array: true, nullable: true })
  summaryAmharic!: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryAmharic!: string;

  @Column({ type: 'text', array: true, nullable: true })
  keyEntities!: string[];

  @Column({ type: 'varchar', length: 20, nullable: true })
  detectedLanguage!: string;

  @Column({ type: 'timestamp', nullable: true })
  summarizedAt!: Date;

  // -----------------------------------------------------------------

  @ManyToOne(() => Source, (source) => source.articles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source!: Source;

  @Column({ type: 'uuid' })
  sourceId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
