import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TemplateService {
  private readonly templatesPath = join(process.cwd(), 'dist', 'templates');

  /**
   * 读取HTML模板文件
   */
  private readTemplate(templateName: string): string {
    const templatePath = join(this.templatesPath, `${templateName}.html`);
    return readFileSync(templatePath, 'utf-8');
  }

  /**
   * 替换模板中的占位符
   */
  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    return result;
  }

  /**
   * 获取首页HTML
   */
  getIndexHTML(): string {
    return this.readTemplate('index');
  }

  /**
   * 获取健康检查页面HTML
   */
  getHealthHTML(healthData: {
    status: string;
    timestamp: string;
    service: string;
    uptime: number;
    version: string;
  }): string {
    const formatUptime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hours}h ${minutes}m ${secs}s`;
    };

    const template = this.readTemplate('health');
    const variables = {
      STATUS: healthData.status.toUpperCase(),
      UPTIME: formatUptime(healthData.uptime),
      SERVICE: healthData.service,
      VERSION: healthData.version,
      TIMESTAMP: new Date(healthData.timestamp).toLocaleString('zh-CN'),
    };

    return this.replaceTemplateVariables(template, variables);
  }
}
