import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndMerge: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = moduleRef.get<RolesGuard>(RolesGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
  });

  const mockReflectorReturnRoles = (roles: (Role | 'ALL')[]) => {
    jest.spyOn(reflector, 'getAllAndMerge').mockReturnValue(roles);
  };

  const getRoleContext = (role: Role | 'ALL'): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role,
          },
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;
  };

  it('should return true if no roles are defined', () => {
    mockReflectorReturnRoles([]);
    const context = getRoleContext(Role.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if ALL is passed', () => {
    mockReflectorReturnRoles(['ALL']);
    const context = getRoleContext(Role.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if the user role is in the roles array', () => {
    mockReflectorReturnRoles([Role.ADMIN]);
    const context = getRoleContext(Role.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if undefined is passed instead of array', () => {
    mockReflectorReturnRoles(undefined);
    const context = getRoleContext(Role.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if the user role is not in the roles array', () => {
    mockReflectorReturnRoles([Role.ADMIN]);
    const context = getRoleContext(Role.STUDENT);
    expect(guard.canActivate(context)).toBe(false);
  });
});
