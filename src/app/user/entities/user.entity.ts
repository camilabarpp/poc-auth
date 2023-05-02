import {
  Column,
  Entity,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'poc-auth' })
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The auto-generated id of the person' })
  id: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  @ApiProperty({ description: 'The name of the person' })
  name: string;

  @Column({ nullable: false, type: 'varchar', length: 20 })
  @ApiProperty({ description: 'The role of the person' })
  role: string;

  @Column({ nullable: false, default: true })
  @ApiProperty({ description: 'The status of the person' })
  status: boolean;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  @ApiProperty({ description: 'The confirmationToken of the person' })
  confirmationToken: string;

  @Column({ nullable: true, type: 'varchar' })
  @ApiProperty({ description: 'The recoverToken of the person' })
  recoverToken: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  @ApiProperty({ description: 'The email of the person' })
  email: string;

  @Column({ nullable: false })
  @ApiProperty({ description: 'The password of the person' })
  password: string;

  @ApiProperty({ description: 'The date the person was created' })
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The date the person was last updated' })
  updatedAt: string;

  @Column({ nullable: false })
  @ApiProperty({ description: 'The salt of the person' })
  salt: string;

  async checkPassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
