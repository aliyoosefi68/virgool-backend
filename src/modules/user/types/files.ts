import { multerFile } from "src/common/utils/multer.util";

export type ProfileImages = {
  image_profile: multerFile[];
  bg_image: multerFile[];
};
