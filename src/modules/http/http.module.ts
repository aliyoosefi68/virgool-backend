import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { KavengarService } from "./kavenegar.service";
@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  providers: [KavengarService],
  exports: [KavengarService],
})
export class CustomHttpModule {}
