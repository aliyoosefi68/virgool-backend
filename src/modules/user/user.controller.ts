import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiConsumes, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  BlockUserDto,
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  ProfileDto,
} from "./dto/profile.dto";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/common/utils/multer.util";
import { ProfileImages } from "./types/files";
import { UploadedOptionFiles } from "src/common/decarator/uploadFiles.decorator";
import { Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { CookieOptionsToken } from "src/common/utils/cookie.util";
import { PublicMessage } from "src/common/enums/message.enum";
import { CheckOtpDto } from "../auth/dto/auth.dto";
import { AuthDecorator } from "src/common/decarator/auth.decorator";
import { Pagination } from "src/common/decarator/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CanAccess } from "src/common/decarator/role.decorator";
import { Roles } from "src/common/enums/roles.enum";

@Controller("user")
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put("/profile")
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "bg_image", maxCount: 1 },
        { name: "image_profile", maxCount: 1 },
      ],
      {
        storage: multerStorage("user-profile"),
      }
    )
  )
  changeProfile(
    @UploadedOptionFiles()
    files: ProfileImages,
    @Body() profileDto: ProfileDto
  ) {
    return this.userService.changeProfile(files, profileDto);
  }

  @Get("/profile")
  async profile() {
    return await this.userService.profile();
  }

  @Patch("/change-email")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) return res.json({ message });

    res.cookie(CookieKeys.EmailOTP, token, CookieOptionsToken());
    res.json({
      message: PublicMessage.SendOtp,
      code,
    });
  }

  @Post("/verify-email")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() verifyDto: CheckOtpDto) {
    return this.userService.verifyEmail(verifyDto.code);
  }

  @Patch("/change-phone")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changePhone(
      phoneDto.phone
    );
    if (message) return res.json({ message });

    res.cookie(CookieKeys.PhoneOTP, token, CookieOptionsToken());
    res.json({
      message: PublicMessage.SendOtp,
      code,
    });
  }
  @Post("/verify-phone")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() verifyDto: CheckOtpDto) {
    return this.userService.verifyPhone(verifyDto.code);
  }

  @Patch("/change-username")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }

  @Get("/follow/:followingId")
  @ApiParam({ name: "followingId" })
  async follow(@Param("followingId", ParseIntPipe) followingId: number) {
    return await this.userService.followToggle(+followingId);
  }

  @Get("/user-list")
  @Pagination()
  async find(@Query() paginationDto: PaginationDto) {
    return await this.userService.find(paginationDto);
  }

  @Get("/followers")
  @Pagination()
  async followers(@Query() paginationDto: PaginationDto) {
    return this.userService.followers(paginationDto);
  }
  @Get("/following")
  @Pagination()
  async following(@Query() paginationDto: PaginationDto) {
    return this.userService.following(paginationDto);
  }

  @Post("/block")
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async block(@Body() blockDto: BlockUserDto) {
    return this.userService.blockToggle(blockDto);
  }
}
