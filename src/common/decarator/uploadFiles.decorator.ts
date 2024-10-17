import { ParseFilePipe, UploadedFiles } from "@nestjs/common";

export function UploadedOptionFiles() {
  return UploadedFiles(
    new ParseFilePipe({
      fileIsRequired: false,
      validators: [],
    })
  );
}
