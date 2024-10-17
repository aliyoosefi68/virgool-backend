import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";
import { isEmail, isMobilePhone } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "../user/entities/profile.entity";
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { OtpEntity } from "../user/entities/otp.entity";
import { randomInt } from "crypto";
import { TokenService } from "./token.service";
import { Request, Response } from "express";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { AuthResponse, GoogleUser } from "./types/response";
import { REQUEST } from "@nestjs/core";
import { CookieOptionsToken } from "src/common/utils/cookie.util";
import { KavengarService } from "../http/kavenegar.service";
import { randomId } from "src/common/utils/function.utils";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(UserEntity)
    private profileRepository: Repository<ProfileEntity>,

    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,

    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService,
    private kavenegarService: KavengarService
  ) {}

  async userExistence(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;
    let result: AuthResponse;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);

        //کد کاوه نگار برای ارسال اس ام اس
        // await this.sendOtpCode(method, username, result.code);
        return this.sendResponse(res, result);

      case AuthType.Register:
        result = await this.register(method, username);
        //کد کاوه نگار برای ارسال اس ام اس
        // await this.sendOtpCode(method, username, result.code);
        return this.sendResponse(res, result);

      default:
        throw new UnauthorizedException();
    }
  }

  //Login service
  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity = await this.checkExistUser(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.sendAndSaveOtp(user.id, method);
    const token = this.tokenService.createOtpToken({ userId: user.id });
    return {
      token,
      code: otp.code,
      mobile: method === AuthMethod.Phone ?? user.phone,
      method,
    };
  }

  //Register Service
  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity;
    user = await this.checkExistUser(method, validUsername);
    if (user) throw new ConflictException(AuthMessage.ExistUser);
    if (method === AuthMethod.Username)
      throw new BadRequestException(BadRequestMessage.InvalidRegisterData);
    user = this.userRepository.create({
      [method]: username,
    });

    user = await this.userRepository.save(user);
    user.username = `m_${user.id}`;
    await this.userRepository.save(user);
    const otp = await this.sendAndSaveOtp(user.id, method);

    const token = this.tokenService.createOtpToken({ userId: user.id });
    return {
      code: otp.code,
      token,
    };
  }

  //send and save otp code method
  async sendAndSaveOtp(userId: number, method: AuthMethod) {
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ userId });
    let existOtp = false;

    if (otp) {
      existOtp = true;
      otp.code = code;
      otp.expiresIn = expiresIn;
      otp.method = method;
    } else {
      otp = this.otpRepository.create({
        code,
        expiresIn,
        userId,
        method,
      });
    }
    otp = await this.otpRepository.save(otp);
    if (!existOtp) {
      await this.userRepository.update({ id: userId }, { otpId: otp.id });
    }
    return otp;
  }

  //check otp method
  async checkOtp(code: string) {
    const token = this.request.cookies?.[CookieKeys.OTP];
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
    const { userId } = this.tokenService.verifyOtpToken(token);
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(AuthMessage.TryAgain);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.LoginAgain);

    const accessToken = this.tokenService.createAccessTokenToken({ userId });

    if (otp.method === AuthMethod.Email) {
      await this.userRepository.update(
        { id: userId },
        {
          verify_email: true,
        }
      );
    } else if (otp.method === AuthMethod.Phone) {
      await this.userRepository.update(
        { id: userId },
        {
          verify_phone: true,
        }
      );
    }

    return {
      message: PublicMessage.LoginSuccessfully,
      accessToken,
    };
  }

  //validation for username
  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException("email format is incorrect");

      case AuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException("Phone number format is  incorrect");

      case AuthMethod.Username:
        return username;

      default:
        throw new UnauthorizedException("username is invalid");
    }
  }

  //check exist user
  async checkExistUser(method: AuthMethod, username: string) {
    let user: UserEntity;
    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({
        phone: username,
      });
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({
        email: username,
      });
    } else if (method === AuthMethod.Username) {
      user = await this.userRepository.findOneBy({
        username,
      });
    } else {
      throw new BadRequestException(BadRequestMessage.InvalidLoginData);
    }

    return user;
  }

  async sendResponse(res: Response, result: AuthResponse) {
    const { token, code } = result;
    res.cookie(CookieKeys.OTP, token, CookieOptionsToken());
    res.json({
      message: PublicMessage.SendOtp,
      code,
    });
  }

  async sendOtpCode(method: AuthMethod, username: string, code: string) {
    if (method === AuthMethod.Email) {
      //Send Email
    } else if (method === AuthMethod.Phone) {
      await this.kavenegarService.sendVerificationSms(username, code);
    }
  }

  async vlaidateAccessToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }

  async googleAuth(userData: GoogleUser) {
    const { email, firstName, lastName, profile_image } = userData;
    let user = await this.userRepository.findOneBy({ email });
    let token: string;
    if (user) {
      token = this.tokenService.createAccessTokenToken({ userId: user.id });
    } else {
      user = this.userRepository.create({
        email,
        verify_email: true,
        username: email.split("@")[0] + randomId(),
      });
      user = await this.userRepository.save(user);
      let profile = this.profileRepository.create({
        userId: user.id,
        nick_name: `${firstName} ${lastName}`,
      });
      profile = await this.profileRepository.save(profile);
      user.profileId = profile.id;
      await this.userRepository.save(user);
      token = this.tokenService.createAccessTokenToken({ userId: user.id });
    }

    return {
      token,
    };
  }
}
