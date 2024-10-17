import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { ImageDto } from "./dto/create-image.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "./entities/image.entity";
import { Repository } from "typeorm";
import { multerFile } from "src/common/utils/multer.util";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private req: Request
  ) {}
  async create(imageDto: ImageDto, image: multerFile) {
    const userId = this.req.user.id;
    const { alt, name } = imageDto;
    let location = image?.path?.slice(7);
    await this.imageRepository.insert({
      alt: alt || name,
      name,
      location,
      userId,
    });
    return {
      message: PublicMessage.Created,
    };
  }

  async findAll() {
    const userId = this.req.user.id;
    const images = await this.imageRepository.find({
      where: { userId },
      order: { id: "DESC" },
    });
    return images;
  }

  async findOne(id: number) {
    const userId = this.req.user.id;
    const image = await this.imageRepository.findOne({
      where: { userId, id },
    });
    if (!image) throw new NotFoundException(NotFoundMessage.Notfound);
    return image;
  }

  async remove(id: number) {
    const image = await this.findOne(id);
    await this.imageRepository.remove(image);
    return {
      message: PublicMessage.Deleted,
    };
  }
}
