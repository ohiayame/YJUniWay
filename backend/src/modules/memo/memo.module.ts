import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memo } from './memo.entity';
import { MemoBlock } from './memo-block.entity';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Memo, MemoBlock])],
  controllers: [MemoController],
  providers: [MemoService],
})
export class MemoModule {}
