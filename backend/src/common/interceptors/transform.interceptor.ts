import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the response has already been formatted, pass through
        if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
          return data;
        }

        const statusCode = response.statusCode;
        const code = statusCode === 201 ? 201 : 200;

        return {
          code,
          message: 'success',
          data,
        };
      }),
    );
  }
}
