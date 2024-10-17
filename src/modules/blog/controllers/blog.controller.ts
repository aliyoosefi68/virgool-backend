import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BlogService } from "../services/blog.service";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { AuthCuard } from "../../auth/guard/auth.guard";
import { Pagination } from "src/common/decarator/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SkipAuth } from "src/common/decarator/skip-auth.decorator";
import { FilterBlog } from "src/common/decarator/filter.decorate";
import { AuthDecorator } from "src/common/decarator/auth.decorator";

@Controller("blog")
@ApiTags("Blog")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createPost(@Body() blogDto: CreateBlogDto) {
    return await this.blogService.createBlog(blogDto);
  }
  @Get("/my-blogs")
  async myBlogs() {
    return await this.blogService.myBlogs();
  }
  @Get("/")
  @Pagination()
  @FilterBlog()
  @SkipAuth()
  find(
    @Query() paginationDto: PaginationDto,
    @Query() filterBlogDto: FilterBlogDto
  ) {
    return this.blogService.blogList(paginationDto, filterBlogDto);
  }
  @Get("/by-slug/:slug")
  @SkipAuth()
  @Pagination()
  findOneBySlug(
    @Param("slug") slug: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.blogService.findOneBySlug(slug, paginationDto);
  }

  @Delete("/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.delete(+id);
  }

  @Put("/:id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateBlog(
    @Param("id", ParseIntPipe) id: number,
    @Body() blogDto: UpdateBlogDto
  ) {
    return await this.blogService.updateBlog(id, blogDto);
  }
  @Get("/like/:id")
  async likeToggle(@Param("id", ParseIntPipe) id: number) {
    return await this.blogService.likeToggle(id);
  }
  @Get("/bookmark/:id")
  async bookmark(@Param("id", ParseIntPipe) id: number) {
    return await this.blogService.BookmarkToggle(id);
  }
}
