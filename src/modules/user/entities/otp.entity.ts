import { EntityNames } from "src/common/enums/entity.enum";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { BaseEntity } from "src/common/abstract/base.entity";

@Entity(EntityNames.Otp)
export class OtpEntity extends BaseEntity {
  @Column({ nullable: true })
  code: string;
  @Column({ nullable: true })
  expiresIn: Date;
  @Column()
  userId: number;
  @OneToOne(() => UserEntity, (user) => user.otp, { onDelete: "CASCADE" })
  @JoinColumn()
  user: UserEntity;
}
