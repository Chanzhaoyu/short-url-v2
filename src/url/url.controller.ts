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
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('urls')
  @UseGuards(JwtAuthGuard)
  create(@Body() createUrlDto: CreateUrlDto, @Request() req: any) {
    return this.urlService.create(createUrlDto, req.user.id);
  }

  @Get('urls')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.urlService.findAll(req.user.id, pageNum, limitNum);
  }

  @Get('urls/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.urlService.findOne(id, req.user.id);
  }

  @Patch('urls/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req: any,
  ) {
    return this.urlService.update(id, updateUrlDto, req.user.id);
  }

  @Delete('urls/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.urlService.remove(id, req.user.id);
  }

  @Get('urls/:id/analytics')
  @UseGuards(JwtAuthGuard)
  getAnalytics(
    @Param('id') id: string,
    @Request() req: any,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.urlService.getAnalytics(id, req.user.id, daysNum);
  }

  // 短链重定向 - 不需要认证
  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      const { redirectUrl } = await this.urlService.redirect(shortCode, req);
      return res.redirect(HttpStatus.MOVED_PERMANENTLY, redirectUrl);
    } catch {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: 404,
        message: '短链不存在或已过期',
      });
    }
  }
}
