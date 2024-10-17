import { Request } from "express";
import { mkdirSync } from "fs";
import { extname, join } from "path";
import { ValidationMessage } from "../enums/message.enum";
import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
export type Callbackdestination = (error: Error, destination: string) => void;
export type CallbackFileName = (error: Error, filename: string) => void;
export type multerFile = Express.Multer.File;

export function multerDestination(fildName: string) {
  return function (
    req: Request,
    file: multerFile,
    callback: Callbackdestination
  ): void {
    let path = join("public", "uploads", fildName);
    mkdirSync(path, { recursive: true });
    callback(null, path);
  };
}
export function multerFileName(
  req: Request,
  file: multerFile,
  callback: CallbackFileName
): void {
  const ext = extname(file.originalname).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) {
    callback(
      new BadRequestException(ValidationMessage.ImageFormatInvalid),
      null
    );
  } else {
    const filename = `${Date.now()}${ext}`;
    callback(null, filename);
  }
}

export function multerStorage(folderName: string) {
  return diskStorage({
    destination: multerDestination(folderName),
    filename: multerFileName,
  });
}
