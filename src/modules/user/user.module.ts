import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { ProfileEntity } from "./entities/profile.entity";
import { OtpEntity } from "./entities/otp.entity";
import { AuthModule } from "../auth/auth.module";
import { ImageEntity } from "../image/entities/image.entity";
import { FollowEntity } from "./entities/follow.entity";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      UserEntity,
      ProfileEntity,
      OtpEntity,
      ImageEntity,
      FollowEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
