import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  private generateApiKey(): string {
    return 'ak_' + randomBytes(32).toString('hex');
  }

  async create(createApiKeyDto: CreateApiKeyDto, userId: string) {
    const { name, expiresAt } = createApiKeyDto;

    // 检查是否已存在同名的 API Key
    const existingApiKey = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingApiKey) {
      throw new ConflictException('API Key with this name already exists');
    }

    const apiKey = this.generateApiKey();

    return this.prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.apiKey.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }

    return apiKey;
  }

  async update(id: string, updateApiKeyDto: UpdateApiKeyDto, userId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }

    // 如果更新名称，检查是否与其他 API Key 冲突
    if (updateApiKeyDto.name && updateApiKeyDto.name !== apiKey.name) {
      const existingApiKey = await this.prisma.apiKey.findFirst({
        where: {
          userId,
          name: updateApiKeyDto.name,
          NOT: {
            id,
          },
        },
      });

      if (existingApiKey) {
        throw new ConflictException('API Key with this name already exists');
      }
    }

    return this.prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        ...updateApiKeyDto,
        expiresAt: updateApiKeyDto.expiresAt
          ? new Date(updateApiKeyDto.expiresAt)
          : undefined,
      },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }

    await this.prisma.apiKey.delete({
      where: {
        id,
      },
    });

    return { message: 'API Key deleted successfully' };
  }

  async validateApiKey(
    key: string,
  ): Promise<{ userId: string; apiKeyId: string } | null> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        key,
      },
      include: {
        user: true,
      },
    });

    if (!apiKey) {
      return null;
    }

    // 检查 API Key 是否激活
    if (!apiKey.isActive) {
      return null;
    }

    // 检查是否过期
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // 更新最后使用时间
    await this.prisma.apiKey.update({
      where: {
        id: apiKey.id,
      },
      data: {
        lastUsedAt: new Date(),
      },
    });

    return {
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
    };
  }
}
