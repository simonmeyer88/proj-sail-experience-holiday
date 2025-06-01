import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { User } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class QuizFindAllPermissionsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user: User = request?.user as User;

    const courseId = request?.query?.courseId;

    // If courseId is not undefined or string, deny access
    if (courseId !== undefined && typeof courseId !== 'string') {
      return false;
    }

    // Allow free access to quizzes if user is ADMIN or TEACHER
    if (user.role === 'ADMIN' || user.role === 'TEACHER') return true;

    // Deny access if user is STUDENT and they are not enrolled in a course
    if (!user.courseId) return false;

    // Deny access if user is using no filter or a different courseId than their own
    if (!courseId) return false;
    if (user.courseId !== courseId) return false;

    return true;
  }
}
