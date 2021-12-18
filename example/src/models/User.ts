import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public id: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @Index()
  @Column({
    unique: true,
    nullable: false,
  })
  public email: string;

  @Column({
    nullable: false,
  })
  public password: string;

  @Column({
    nullable: false,
  })
  public salt: string;

  @Column({
    default: true,
  })
  public isActive: Boolean;
}
