import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Gender } from "../enum/gender.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class ProfileDto {
  @ApiPropertyOptional()
  @Length(3, 100)
  @IsOptional()
  nick_name: string;
  @ApiPropertyOptional({ nullable: true })
  @Length(10, 200)
  @IsOptional()
  bio: string;
  @ApiPropertyOptional({ nullable: true, format: "binary" })
  image_profile: string;
  @ApiPropertyOptional({ nullable: true, format: "binary" })
  bg_image: string;
  @ApiPropertyOptional({ nullable: true, enum: Gender })
  @IsOptional()
  gender: string;
  @ApiPropertyOptional({ nullable: true, example: "1996-09-18T15:31:11.915Z" })
  birthday: Date;
  @ApiPropertyOptional({ nullable: true })
  linkedin_profile: string;
  @ApiPropertyOptional({ nullable: true })
  x_profile: string;
}

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: ValidationMessage.InvalidEmail })
  email: string;
}
export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone("fa-IR", {}, { message: ValidationMessage.InvalidPhone })
  phone: string;
}
export class ChangeUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(3, 50)
  username: string;
}
export class BlockUserDto {
  @ApiProperty()
  userId: number;
}
