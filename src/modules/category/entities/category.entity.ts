import { BaseEntity } from "src/common/abstract/base.entity";
import { EntityNames } from "src/common/enums/entity.enum";
import { BlogCategoryEntity } from "src/modules/blog/entties/blog-category.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity(EntityNames.Category)
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  priority: number;

  @OneToMany(() => BlogCategoryEntity, (blog) => blog.category)
  blog_categories: BlogCategoryEntity[];
}
