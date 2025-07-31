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

@Controller('api/v1')
@UseGuards(ApiKeyGuard)
export class OpenApiController {
  constructor(private readonly urlService: UrlService) {}

  @Post('urls')
  create(@Body() createUrlDto: CreateUrlDto, @Request() req) {
    return this.urlService.create(createUrlDto, req.user.userId);
  }

  @Get('urls')
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
  findOne(@Param('shortCode') shortCode: string, @Request() req) {
    return this.urlService.findOne(shortCode, req.user.userId);
  }

  @Patch('urls/:shortCode')
  update(
    @Param('shortCode') shortCode: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req,
  ) {
    return this.urlService.update(shortCode, updateUrlDto, req.user.userId);
  }

  @Delete('urls/:shortCode')
  remove(@Param('shortCode') shortCode: string, @Request() req) {
    return this.urlService.remove(shortCode, req.user.userId);
  }

  @Get('urls/:shortCode/analytics')
  getAnalytics(@Param('shortCode') shortCode: string, @Request() req) {
    return this.urlService.getAnalytics(shortCode, req.user.userId);
  }
}
