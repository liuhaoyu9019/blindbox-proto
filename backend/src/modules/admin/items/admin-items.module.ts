import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AdminItemsController } from './admin-items.controller';
import { AdminItemsService } from './admin-items.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AdminItemsController],
  providers: [AdminItemsService],
})
export class AdminItemsModule {}
