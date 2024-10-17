import { BaseEntity } from "src/common/abstract/base.entity";
import { EntityNames } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
} from "typeorm";
@Entity(EntityNames.Image)
export class ImageEntity extends BaseEntity {
  @Column()
  name: string;
  @Column()
  location: string;
  @Column()
  alt: string;
  @Column()
  userId: number;
  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.images, { onDelete: "CASCADE" })
  user: UserEntity;

  @AfterLoad()
  map() {
    this.location = `http://localhost:3000/${this.location.replace(/\\/g, "/")}`;
  }
}
