import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UrlModule } from './url/url.module';
import { CacheModule } from './cache/cache.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { OpenApiModule } from './open-api/open-api.module';
import { TemplateModule } from './template/template.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UrlModule,
    CacheModule,
    ApiKeyModule,
    OpenApiModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
