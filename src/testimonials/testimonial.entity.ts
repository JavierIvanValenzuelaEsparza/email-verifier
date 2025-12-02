import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  company: string;

  @Column()
  projectType: string;

  @Column()
  rating: number;

  @Column('text')
  opinion: string;

  @CreateDateColumn()
  createdAt: Date;
}
