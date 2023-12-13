import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TokenPruningService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async pruneOldTokens() {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 8);
    // thresholdDate.setDate(thresholdDate.getMonth() - 3);
    // thresholdDate.setDate(thresholdDate.getDate() + 1);

    await this.prisma.revokedToken.deleteMany({
      where: {
        createdAt: {
          lte: thresholdDate,
        },
      },
    });
  }
}
