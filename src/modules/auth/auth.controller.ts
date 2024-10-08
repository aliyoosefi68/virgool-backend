import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthDto, CheckOtpDto } from "./dto/auth.dto";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("user-existence")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res);
  }
  @Post("check-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  checkOtp(@Body() checkOtp: CheckOtpDto) {
    return this.authService.checkOtp(checkOtp.code);
  }
}
