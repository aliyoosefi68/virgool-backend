import { NestFactory } from "@nestjs/core";
import { SwaggerConfigInit } from "./config/swagger.config";
import { AppModule } from "./modules/app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerConfigInit(app);
  const { PORT } = process.env;
  await app.listen(PORT, () => {
    console.log("server run on port 3000=> http://localhost:3000");
    console.log("swagger => http://localhost:3000/swagger");
  });
}
bootstrap();
