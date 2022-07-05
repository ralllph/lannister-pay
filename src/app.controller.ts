import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TransactionParams } from './dto/split.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('split-payments/compute')
  @HttpCode(200)
  splitPayments(@Body() input: TransactionParams) {
    return this.appService.computeSplitPayments(input);
  }
}
