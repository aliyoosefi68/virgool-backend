import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entties/blog.entity";
import { DataSource, Repository } from "typeorm";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { createSlug, randomId } from "src/common/utils/function.utils";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import {
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.util";
import { isArray } from "class-validator";
import { CategoryService } from "../../category/category.service";
import { BlogCategoryEntity } from "../entties/blog-category.entity";
import { EntityNames } from "src/common/enums/entity.enum";
import { BlogLikesEntity } from "../entties/like.entity";
import { BlogBookmarkEntity } from "../entties/bookmork.entity";
import { BlogCommentService } from "./comment.service";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,

    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,

    @InjectRepository(BlogLikesEntity)
    private blogLikeRepository: Repository<BlogLikesEntity>,

    @InjectRepository(BlogBookmarkEntity)
    private blogBookmarkRepository: Repository<BlogBookmarkEntity>,

    @Inject(REQUEST) private request: Request,

    private categoryService: CategoryService,

    @Inject(forwardRef(() => BlogCommentService))
    private blogCommentService: BlogCommentService,

    private dataSource: DataSource
  ) {}

  async createBlog(blogDto: CreateBlogDto) {
    const user = this.request.user;
    let {
      slug,
      title,
      content,
      time_for_study,
      describtion,
      image,
      categories,
    } = blogDto;

    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",");
    } else if (!categories) {
      throw new BadRequestException(BadRequestMessage.InvalidCategoties);
    }

    let slugData = slug ?? title;
    slug = createSlug(slugData);
    const isExistSlug = await this.checkBlogBySlug(slug);
    if (isExistSlug) {
      slug += `-${randomId()}`;
    }
    let blog = this.blogRepository.create({
      slug,
      title,
      content,
      time_for_study,
      describtion,
      image,
      authorId: user.id,
    });
    blog = await this.blogRepository.save(blog);
    for (const categoryTitle of categories) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);

      if (!category) {
        category = await this.categoryService.createByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
    return {
      message: PublicMessage.Created,
    };
  }

  async myBlogs() {
    const { id } = this.request.user;
    return this.blogRepository.find({
      where: {
        authorId: id,
      },
      order: {
        id: "DESC",
      },
    });
  }

  async blogList(paginationDto: PaginationDto, filterBlogDto: FilterBlogDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    let { category, search } = filterBlogDto;
    let where = "";

    if (category) {
      category = category.toLowerCase();
      if (where.length > 0) where += " AND ";
      where += "category.title ILIKE :category";
    }
    if (search) {
      if (where.length > 0) where += " AND ";
      search = `%${search}%`;
      where +=
        "CONCAT(blog.title, blog.describtion, blog.content) ILIKE :search";
    }
    const [blogs, count] = await this.blogRepository
      .createQueryBuilder(EntityNames.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("blog.author", "author")
      .leftJoin("author.profile", "profile")
      .addSelect([
        "categories.id",
        "category.title",
        "author.username",
        "author.id",
        "profile.nick_name",
      ])
      .where(where, { category, search })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
      .loadRelationCountAndMap(
        "blog.comments",
        "blog.comments",
        "comments",
        (qb) => qb.where("comments.accepted= :accepted", { accepted: true })
      )
      .orderBy("blog.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // const [blogs, count] = await this.blogRepository.findAndCount({
    //   relations: {
    //     categories: {
    //       category: true,
    //     },
    //   },
    //   where,
    //   select: {
    //     categories: {
    //       id: true,
    //       category: {
    //         id: true,
    //         title: true,
    //       },
    //     },
    //   },
    //   order: {
    //     id: "DESC",
    //   },
    //   skip,
    //   take: limit,
    // });
    return {
      pagination: paginationGenerator(count, page, limit),
      blogs,
    };
  }
  async delete(id: number) {
    const blog = await this.checkExistBlogById(id);
    await this.blogRepository.delete(id);
    return {
      message: PublicMessage.Deleted,
    };
  }

  async updateBlog(id: number, blogDto: UpdateBlogDto) {
    const user = this.request.user;
    let {
      slug,
      title,
      content,
      time_for_study,
      describtion,
      image,
      categories,
    } = blogDto;

    const blog = await this.blogRepository.findOneBy({ id });
    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",");
    } else if (!categories) {
      throw new BadRequestException(BadRequestMessage.InvalidCategoties);
    }

    let slugData = null;

    if (title) {
      slugData = title;
      slug = createSlug(slugData);
      blog.title = title;
    }
    if (slug) slugData = slug;
    if (slugData) {
      slug = createSlug(slugData);
      const isExistSlug = await this.checkBlogBySlug(slug);
      if (isExistSlug && isExistSlug.id !== id) {
        slug += `-${randomId()}`;
      }
      blog.slug = slug;
    }
    if (content) blog.content = content;
    if (time_for_study) blog.time_for_study = time_for_study;
    if (describtion) blog.describtion = describtion;
    if (image) blog.image = image;

    await this.blogRepository.save(blog);
    if (categories && isArray(categories) && categories.length > 0) {
      await this.blogCategoryRepository.delete({ blogId: blog.id });
    }

    //loop for categories
    for (const categoryTitle of categories) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);

      if (!category) {
        category = await this.categoryService.createByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
    return {
      message: PublicMessage.Created,
    };
  }

  async likeToggle(blogId: number) {
    const { id: userId } = this.request.user;
    const blog = await this.checkExistBlogById(blogId);
    const isLiked = await this.blogLikeRepository.findOneBy({ userId, blogId });
    if (isLiked) {
      await this.blogLikeRepository.delete({ id: isLiked.id });
      return {
        message: PublicMessage.DisLike,
      };
    }
    await this.blogLikeRepository.insert({
      blogId,
      userId,
    });

    return {
      message: PublicMessage.Like,
    };
  }
  async BookmarkToggle(blogId: number) {
    const { id: userId } = this.request.user;
    const blog = await this.checkExistBlogById(blogId);
    const isBookmarked = await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId,
    });
    if (isBookmarked) {
      await this.blogLikeRepository.delete({ id: isBookmarked.id });
      return {
        message: PublicMessage.UnBookmark,
      };
    }
    await this.blogBookmarkRepository.insert({
      blogId,
      userId,
    });

    return {
      message: PublicMessage.Bookmark,
    };
  }

  async checkExistBlogById(id: number) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException(NotFoundMessage.NotfoundPost);
    return blog;
  }

  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });
    return blog;
  }

  async findOneBySlug(slug: string, paginationDto: PaginationDto) {
    const userId = this.request?.user?.id;
    const blog = await this.blogRepository
      .createQueryBuilder(EntityNames.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("blog.author", "author")
      .leftJoin("author.profile", "profile")
      .addSelect([
        "categories.id",
        "category.title",
        "author.username",
        "author.id",
        "profile.nick_name",
      ])
      .where({ slug })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
      .leftJoinAndSelect(
        "blog.comments",
        "comments",
        "comments.accepted = :accepted",
        { accepted: true }
      )
      .getOne();

    if (!blog) throw new NotFoundException(NotFoundMessage.NotfoundPost);
    const commentsData = await this.blogCommentService.findCommentsOfBlog(
      blog.id,
      paginationDto
    );

    let isLiked = false;
    let isBookmarked = false;

    if (userId && !isNaN(userId) && userId > 0) {
      isLiked = !!(await this.blogLikeRepository.findOneBy({
        userId,
        blogId: blog.id,
      }));
      isBookmarked = !!(await this.blogBookmarkRepository.findOneBy({
        userId,
        blogId: blog.id,
      }));
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const suggestBlogs = await queryRunner.query(`
      WITH suggested_blogs As(
        SELECT
            blog.id,
            blog.title,
            blog.describtion,
            blog.slug,
            blog.time_for_study,
            blog.image,
            json_build_object(
                'username', u.username,
                'author_name', p.nick_name,
                'image', p.image_profile
            ) AS author,
            array_agg(DISTINCT cat.title) AS categories,
            (
                SELECT COUNT(*) FROM blog_like
                WHERE blog_like."blogId" = blog.id
            ) AS likes,
            (
                SELECT COUNT(*) FROM blog_bookmarks
                WHERE blog_bookmarks."blogId" = blog.id
            ) AS bookmarks,
            (
                SELECT COUNT(*) FROM blog_comments
                WHERE blog_comments."blogId" = blog.id
            ) AS comments
        FROM blog
        LEFT JOIN public.user u ON blog."authorId" = u.id
        LEFT JOIN profile p ON p."userId" = u.id
        LEFT JOIN blog_category bc ON blog.id = bc."blogId"
        LEFT JOIN category cat ON bc."categoryId" = cat.id
        GROUP BY blog.id, u.username, p.nick_name, p.image_profile
        ORDER BY RANDOM()
        LIMIT 3
      )
      SELECT * FROM suggested_blogs
      `);
    return {
      blog,
      isLiked,
      isBookmarked,
      commentsData,
      suggests: suggestBlogs,
    };
  }
}
