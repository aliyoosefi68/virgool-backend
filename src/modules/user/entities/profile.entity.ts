import { BaseEntity } from "src/common/abstract/base.entity";
import { EntityNames } from "src/common/enums/entity.enum";
import { Column, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { IsEnum } from "class-validator";
import { Gender } from "../enum/gender.enum";

@Entity(EntityNames.Profile)
export class ProfileEntity extends BaseEntity {
  @Column()
  nick_name: string;
  @Column()
  userId: number;
  @Column({ nullable: true })
  bio: string;
  @Column({ nullable: true })
  image_profile: string;
  @Column({ nullable: true })
  bg_image: string;
  @Column({ nullable: true })
  @IsEnum(Gender)
  gender: string;
  @Column({ nullable: true })
  birthday: Date;
  @Column({ nullable: true })
  linkedin_profile: string;
  @Column({ nullable: true })
  x_profile: string;
  @OneToOne(() => UserEntity, (user) => user.profile, { onDelete: "CASCADE" })
  user: UserEntity;
}
