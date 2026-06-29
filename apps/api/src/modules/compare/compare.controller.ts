import { Controller, Get, Post, Delete, Param, ParseUUIDPipe, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CompareService } from './compare.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Compare')
@Public()
@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  private getSessionId(req: Request): string {
    return (req.cookies?.['session_id'] as string) ?? req.ip ?? 'anon';
  }

  @Get()
  getList(@Req() req: Request) {
    return this.compareService.getCompareList(this.getSessionId(req));
  }

  @Post(':productId')
  add(@Req() req: Request, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.compareService.addToCompare(this.getSessionId(req), productId);
  }

  @Delete('clear')
  clear(@Req() req: Request) {
    return this.compareService.clearCompare(this.getSessionId(req));
  }

  @Delete(':productId')
  remove(@Req() req: Request, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.compareService.removeFromCompare(this.getSessionId(req), productId);
  }
}
