import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  StatsTeacherResponse,
  StatsAdminResponse,
  StatsStudentResponse,
} from './stats.response';
import { User } from '@prisma/client';
@Injectable()
export class StatsService {
  constructor(private readonly databaseService: DatabaseService) {}

  private async getUserStats() {
    const LAST_WEEK = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const LAST_MONTH = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = await this.databaseService.user.count();
    const totalUsersRegisteredLastWeek = await this.databaseService.user.count({
      where: {
        createdAt: {
          gte: LAST_WEEK,
        },
      },
    });
    const totalUsersRegisteredLastMonth = await this.databaseService.user.count(
      {
        where: {
          createdAt: {
            gte: LAST_MONTH,
          },
        },
      },
    );

    const totalActiveUsers = await this.databaseService.user.count({
      where: {
        isActive: true,
      },
    });

    const totalAwaitingApproval = await this.databaseService.user.count({
      where: {
        role: {
          in: ['AWAITINGTEACHER', 'AWAITINGSTUDENT'],
        },
      },
    });

    return {
      registered: {
        allTime: totalUsers,
        lastWeek: totalUsersRegisteredLastWeek,
        lastMonth: totalUsersRegisteredLastMonth,
      },
      active: totalActiveUsers,
      awaitingApproval: totalAwaitingApproval,
    };
  }

  public async getStatsStudent(user: User): Promise<StatsStudentResponse> {
    const quizAttemptsSummary = (await this.databaseService.$queryRaw`
      SELECT DATE(createdAt) AS day, COUNT(*) AS numberTaken
      FROM QuizAttempt
      WHERE userId = ${user.id}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY day
    `) as { day: Date; numberTaken: number }[];

    const usersOnEventsCompleted =
      await this.databaseService.usersOnEvents.count({
        where: {
          userId: user.id,
          isCompleted: true,
        },
      });

    const payments = await this.databaseService.payment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    return {
      payments: payments.map((payment) => ({
        date: payment.paidAt,
        amount: Number(payment.amount),
        isSubscription: payment.type === 'SUBSCRIPTION',
      })),
      quizAttemptsSummary: {
        lastMonth: quizAttemptsSummary.map((summary) => ({
          day: summary.day,
          // Convert to number because Prisma returns BigInt
          numberTaken: Number(summary.numberTaken),
        })),
      },
      usersOnEventsCompleted: {
        total: usersOnEventsCompleted,
      },
    };
  }

  public async getStatsAdmin(): Promise<StatsAdminResponse> {
    const LAST_WEEK = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const LAST_MONTH = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const paymentsAllTime = await this.databaseService.payment.findMany();
    const revenueAllTime = paymentsAllTime.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    const numberOfSalesAllTime = paymentsAllTime.length;

    const paymentsLastWeek = await this.databaseService.payment.findMany({
      where: {
        paidAt: {
          gte: LAST_WEEK,
        },
      },
    });
    const revenueLastWeek = paymentsLastWeek.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    const numberOfSalesLastWeek = paymentsLastWeek.length;

    const paymentsLastMonth = await this.databaseService.payment.findMany({
      where: {
        paidAt: {
          gte: LAST_MONTH,
        },
      },
    });
    const revenueLastMonth = paymentsLastMonth.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    const numberOfSalesLastMonth = paymentsLastMonth.length;

    // relation is payment -> user (student) -> course
    const revenuePerCourse = (await this.databaseService.$queryRaw`
      SELECT Course.id, Course.name, SUM(Payment.amount) AS totalRevenue, COUNT(*) AS numberOfSales
        FROM Payment
        JOIN User ON User.id = Payment.userId
        JOIN Course ON Course.id = User.courseId
        GROUP BY Course.id
    `) as {
      id: string;
      name: string;
      totalRevenue: number;
      numberOfSales: number;
    }[];

    const users = await this.getUserStats();

    return {
      finances: {
        perCourse: revenuePerCourse.map((course) => ({
          id: course.id,
          name: course.name,
          totalRevenue: Number(course.totalRevenue),
          numberOfSales: Number(course.numberOfSales),
        })),
        allTime: {
          totalRevenue: revenueAllTime,
          numberOfSales: numberOfSalesAllTime,
        },
        lastWeek: {
          totalRevenue: revenueLastWeek,
          numberOfSales: numberOfSalesLastWeek,
        },
        lastMonth: {
          totalRevenue: revenueLastMonth,
          numberOfSales: numberOfSalesLastMonth,
        },
      },
      users,
    };
  }

  public async getStatsTeacher(): Promise<StatsTeacherResponse> {
    const users = await this.getUserStats();

    return {
      users,
    };
  }
}
