import { BaseEntity } from "src/common/abstract/base.entity";
import { EntityNames } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";

@Entity(EntityNames.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({ nullable: true })
  password: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
