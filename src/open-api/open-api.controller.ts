import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UrlService } from '../url/url.service';
import { CreateUrlDto } from '../url/dto/create-url.dto';
import { UpdateUrlDto } from '../url/dto/update-url.dto';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import {
  RateLimit,
  RateLimitPresets,
} from '../rate-limit/rate-limit.decorator';

@Controller('api/v1')
@UseGuards(ApiKeyGuard, RateLimitGuard)
export class OpenApiController {
  constructor(private readonly urlService: UrlService) {}

  @Post('urls')
  @RateLimit(RateLimitPresets.CREATE)
  create(@Body() createUrlDto: CreateUrlDto, @Request() req) {
    return this.urlService.create(createUrlDto, req.user.userId);
  }

  @Get('urls')
  @RateLimit(RateLimitPresets.READ)
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.urlService.findAll(req.user.userId, pageNum, limitNum);
  }

  @Get('urls/:shortCode')
  @RateLimit(RateLimitPresets.READ)
  findOne(@Param('shortCode') shortCode: string, @Request() req) {
    return this.urlService.findOne(shortCode, req.user.userId);
  }

  @Patch('urls/:shortCode')
  @RateLimit(RateLimitPresets.UPDATE)
  update(
    @Param('shortCode') shortCode: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req,
  ) {
    return this.urlService.update(shortCode, updateUrlDto, req.user.userId);
  }

  @Delete('urls/:shortCode')
  @RateLimit(RateLimitPresets.DELETE)
  remove(@Param('shortCode') shortCode: string, @Request() req) {
    return this.urlService.remove(shortCode, req.user.userId);
  }

  @Get('urls/:shortCode/analytics')
  @RateLimit(RateLimitPresets.READ)
  getAnalytics(@Param('shortCode') shortCode: string, @Request() req) {
    return this.urlService.getAnalytics(shortCode, req.user.userId);
  }
}
