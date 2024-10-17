import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  Length,
} from "class-validator";

export class CreateBlogDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(10, 150)
  title: string;
  @ApiProperty()
  @IsNotEmpty()
  authorId: number;
  @ApiPropertyOptional()
  slug: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  time_for_study: number;
  @ApiPropertyOptional()
  image: string;
  @ApiProperty()
  @IsNotEmpty()
  @Length(10, 300)
  describtion: string;
  @ApiProperty()
  @IsNotEmpty()
  @Length(100)
  content: string;

  @ApiProperty({ type: String, isArray: true })
  @IsNotEmpty()
  categories: string[] | string;
}
export class UpdateBlogDto extends PartialType(CreateBlogDto) {}

// export class filterBlogDto {
//   search: string;
// }
export class FilterBlogDto {
  category: string;
  search: string;
}
