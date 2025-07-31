import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response): void {
    const html = this.appService.getHelloHTML();
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

    const html = this.appService.getHealthHTML(healthData);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
