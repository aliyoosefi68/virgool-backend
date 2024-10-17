import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ImageDto {
  @ApiPropertyOptional()
  alt: string;
  @ApiProperty()
  name: string;
  @ApiPropertyOptional({ format: "binary" })
  image: string;
}
