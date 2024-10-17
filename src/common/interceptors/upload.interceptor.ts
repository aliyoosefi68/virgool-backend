import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "../utils/multer.util";

export function UploadFiles(fieldName: string, foolderName: string = "images") {
  return class UploadUtility extends FileInterceptor(fieldName, {
    storage: multerStorage(foolderName),
  }) {};
}
