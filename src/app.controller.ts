import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { TemplateService } from './template/template.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly templateService: TemplateService,
  ) {}

  @Get()
  getHello(@Res() res: Response): void {
    const html = this.templateService.getIndexHTML();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('health')
  getHealth(@Res() res: Response): void {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'short-url-api',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    const html = this.templateService.getHealthHTML(healthData);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
