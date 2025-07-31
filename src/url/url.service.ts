import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.interface';
import { CACHE_SERVICE } from '../cache/cache.module';

@Injectable()
export class UrlService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_SERVICE) private cacheService: CacheService,
  ) {}

  private generateShortCode(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getCacheKey(shortCode: string): string {
    return `url:${shortCode}`;
  }

  private getUserUrlsCacheKey(
    userId: string,
    page: number,
    limit: number,
  ): string {
    return `user_urls:${userId}:${page}:${limit}`;
  }

  async create(createUrlDto: CreateUrlDto, userId: string) {
    const {
      originalUrl,
      shortCode: customShortCode,
      title,
      description,
      expiresAt,
    } = createUrlDto;

    let shortCode = customShortCode;

    // 如果没有提供自定义短码，生成一个
    if (!shortCode) {
      do {
        shortCode = this.generateShortCode();
        const existing = await this.prisma.url.findUnique({
          where: { shortCode },
        });
        if (!existing) break;
      } while (true);
    } else {
      // 检查自定义短码是否已存在
      const existing = await this.prisma.url.findUnique({
        where: { shortCode },
      });
      if (existing) {
        throw new ConflictException('短码已存在');
      }
    }

    const url = await this.prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        title,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // 缓存新创建的短链信息
    const cacheData = {
      id: url.id,
      originalUrl: url.originalUrl,
      userId: url.userId,
      isActive: url.isActive,
      expiresAt: url.expiresAt,
    };
    const cacheTTL = this.configService.get<number>('CACHE_TTL', 300);
    await this.cacheService.set(
      this.getCacheKey(url.shortCode),
      cacheData,
      cacheTTL,
    );

    return {
      ...url,
      shortUrl: `${this.configService.get('APP_URL')}/${url.shortCode}`,
    };
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      this.prisma.url.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { clicks: true },
          },
        },
      }),
      this.prisma.url.count({
        where: { userId },
      }),
    ]);

    return {
      urls: urls.map((url) => ({
        ...url,
        shortUrl: `${this.configService.get('APP_URL')}/${url.shortCode}`,
        clickCount: url._count.clicks,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const url = await this.prisma.url.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { clicks: true },
        },
        clicks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!url) {
      throw new NotFoundException('短链不存在');
    }

    return {
      ...url,
      shortUrl: `${this.configService.get('APP_URL')}/${url.shortCode}`,
      clickCount: url._count.clicks,
    };
  }

  async update(id: string, updateUrlDto: UpdateUrlDto, userId: string) {
    const url = await this.prisma.url.findFirst({
      where: { id, userId },
    });

    if (!url) {
      throw new NotFoundException('短链不存在');
    }

    const updatedUrl = await this.prisma.url.update({
      where: { id },
      data: {
        ...updateUrlDto,
        expiresAt: updateUrlDto.expiresAt
          ? new Date(updateUrlDto.expiresAt)
          : undefined,
      },
    });

    // 清除缓存，因为数据已更新
    await this.cacheService.del(this.getCacheKey(updatedUrl.shortCode));

    return {
      ...updatedUrl,
      shortUrl: `${this.configService.get('APP_URL')}/${updatedUrl.shortCode}`,
    };
  }

  async remove(id: string, userId: string) {
    const url = await this.prisma.url.findFirst({
      where: { id, userId },
    });

    if (!url) {
      throw new NotFoundException('短链不存在');
    }

    await this.prisma.url.delete({
      where: { id },
    });

    // 清除缓存
    await this.cacheService.del(this.getCacheKey(url.shortCode));

    return { message: '短链已删除' };
  }

  async redirect(shortCode: string, req: any) {
    // 首先尝试从缓存获取
    const cacheKey = this.getCacheKey(shortCode);
    let url = await this.cacheService.get<any>(cacheKey);

    if (!url) {
      // 缓存未命中，从数据库查询
      url = await this.prisma.url.findUnique({
        where: { shortCode },
      });

      if (!url) {
        throw new NotFoundException('短链不存在');
      }

      // 缓存查询结果
      const cacheData = {
        id: url.id,
        originalUrl: url.originalUrl,
        userId: url.userId,
        isActive: url.isActive,
        expiresAt: url.expiresAt,
      };
      const cacheTTL = this.configService.get<number>('CACHE_TTL', 300);
      await this.cacheService.set(cacheKey, cacheData, cacheTTL);
    }

    if (!url.isActive) {
      throw new BadRequestException('短链已禁用');
    }

    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      throw new BadRequestException('短链已过期');
    }

    // 记录点击
    await this.prisma.click.create({
      data: {
        urlId: url.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
      },
    });

    // 更新点击计数
    await this.prisma.url.update({
      where: { id: url.id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });

    return { redirectUrl: url.originalUrl };
  }

  async getAnalytics(id: string, userId: string, days = 7) {
    const url = await this.prisma.url.findFirst({
      where: { id, userId },
    });

    if (!url) {
      throw new NotFoundException('短链不存在');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clicks = await this.prisma.click.findMany({
      where: {
        urlId: url.id,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 按日期分组点击量
    const clicksByDate = clicks.reduce((acc, click) => {
      const date = click.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // 按来源分组
    const clicksByReferer = clicks.reduce((acc, click) => {
      const referer = click.referer || 'Direct';
      acc[referer] = (acc[referer] || 0) + 1;
      return acc;
    }, {});

    return {
      url: {
        ...url,
        shortUrl: `${this.configService.get('APP_URL')}/${url.shortCode}`,
      },
      totalClicks: clicks.length,
      clicksByDate,
      clicksByReferer,
      recentClicks: clicks.slice(0, 20),
    };
  }
}
