import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TransactionParams } from './dto/split.dto';
import { calculatePercentage } from './helpers/calculatePercentage';
import { calculateTotalRatio } from './helpers/calculateTotalRatio';

@Injectable()
export class AppService {
  computeSplitPayments(input: TransactionParams) {
    if (input.SplitInfo.length < 1 || input.SplitInfo.length > 20) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Split info must be more than 1 or less than 20',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    let currBalance = input.Amount;
    let ratioStaticBalance: number;
    let totalValueComputed: number = 0;
    const SplitBreakdown = [];

    input.SplitInfo.filter(
      (elements) => elements.SplitType.toLowerCase() === 'flat',
    ).forEach((element) => {
      if (element.SplitValue > input.Amount || element.SplitValue < 0) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error:
              'split amount cannot be greater than transaction amount or lesser than 0',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      totalValueComputed += element.SplitValue;
      SplitBreakdown.push({
        SplitEntityId: element.SplitEntityId,
        Amount: element.SplitValue,
      });
      if (currBalance <= 0) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Insufficient Balance',
          },
          HttpStatus.FORBIDDEN,
        );
      } else currBalance -= element.SplitValue;
    });

    input.SplitInfo.filter(
      (elements) => elements.SplitType.toLowerCase() === 'percentage',
    ).forEach((element) => {
      const percent = calculatePercentage(currBalance, element.SplitValue);
      if (percent > input.Amount || element.SplitValue < 0) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'split amount cannot be greater than transaction amount',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      totalValueComputed += percent;
      SplitBreakdown.push({
        SplitEntityId: element.SplitEntityId,
        Amount: percent,
      });
      if (currBalance <= 0) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Insufficient Balance',
          },
          HttpStatus.FORBIDDEN,
        );
      } else currBalance -= percent;
    });

    input.SplitInfo.filter((elements) => {
      ratioStaticBalance = currBalance;
      return elements.SplitType.toLowerCase() === 'ratio';
    }).forEach((element) => {
      const ratioAmount =
        (element.SplitValue / calculateTotalRatio(input.SplitInfo)) *
        ratioStaticBalance;
      if (ratioAmount > input.Amount || element.SplitValue < 0) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'split amount cannot be greater than transaction amount',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      totalValueComputed += ratioAmount;
      SplitBreakdown.push({
        SplitEntityId: element.SplitEntityId,
        Amount: ratioAmount,
      });
      if (currBalance <= 0) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Insufficient Balance',
          },
          HttpStatus.FORBIDDEN,
        );
      } else currBalance -= ratioAmount;
    });

    if (totalValueComputed > input.Amount) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Computed value cannot be greater than amount',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      ID: input.ID,
      Balance: currBalance,
      SplitBreakdown,
    };
  }
}
