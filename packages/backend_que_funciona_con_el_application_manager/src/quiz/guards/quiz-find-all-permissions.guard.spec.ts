import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { QuizFindAllPermissionsGuard } from './quiz-find-all-permissions.guard';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: QuizFindAllPermissionsGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [QuizFindAllPermissionsGuard],
    }).compile();

    guard = moduleRef.get<QuizFindAllPermissionsGuard>(
      QuizFindAllPermissionsGuard,
    );
  });

  const getMockContext = (
    user: {
      role: Role;
      courseId?: string;
    },
    query: {
      courseId?: string;
    },
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            ...user,
            courseId: user.courseId ?? null,
          },
          query,
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;
  };

  it('should return true for ADMIN and no query', async () => {
    const context = getMockContext({ role: 'ADMIN' }, {});
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true for ADMIN and any query', async () => {
    const context = getMockContext({ role: 'ADMIN' }, { courseId: '1' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true for TEACHER and no query', async () => {
    const context = getMockContext({ role: 'TEACHER' }, {});
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true for TEACHER and any query', async () => {
    const context = getMockContext({ role: 'TEACHER' }, { courseId: '1' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false for STUDENT and no query, student enrolled', async () => {
    const context = getMockContext({ role: 'STUDENT', courseId: '1' }, {});
    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return false for STUDENT and no query, student not enrolled', async () => {
    const context = getMockContext({ role: 'STUDENT' }, {});
    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return false for STUDENT and query, student is not enrolled', async () => {
    const context = getMockContext({ role: 'STUDENT' }, { courseId: '1' });
    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return false for STUDENT and query, student enrolled, but not matching courseId', async () => {
    const context = getMockContext({ role: 'STUDENT' }, { courseId: '1' });
    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return true for STUDENT and query, student enrolled, matching courseId', async () => {
    const context = getMockContext(
      { role: 'STUDENT', courseId: '1' },
      { courseId: '1' },
    );
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
