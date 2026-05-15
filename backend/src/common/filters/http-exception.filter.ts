import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 5000;
    let message = '服务器内部错误';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        errors = resp.errors;

        // Map HTTP status to business code
        code = this.mapHttpStatusToBusinessCode(status, message);
      } else {
        message = String(exceptionResponse);
        code = this.mapHttpStatusToBusinessCode(status, message);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      code,
      message,
      data: null,
      ...(errors ? { errors } : {}),
    });
  }

  private mapHttpStatusToBusinessCode(status: number, message?: string): number {
    const codeMap: Record<number, number> = {
      400: 4000,
      401: message?.includes('密码') || message?.includes('password') ? 4011 : 4010,
      403: 4030,
      404: 4040,
      409: 4090,
      413: 4130,
      429: 4290,
    };
    return codeMap[status] || status * 10;
  }
}
