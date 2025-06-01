import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenInterceptor } from './refresh-token.interceptor';
import { AuthService } from './auth.service';
import { ExecutionContext } from '@nestjs/common';

describe('RefreshTokenInterceptor', () => {
  let refreshInterceptor: RefreshTokenInterceptor;
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenInterceptor,
        {
          provide: AuthService,
          useValue: {
            setAuthCookie: jest.fn(),
          },
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    refreshInterceptor = module.get<RefreshTokenInterceptor>(
      RefreshTokenInterceptor,
    );
  });

  const mockCookieFn = jest.fn();
  const getMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
        getResponse: () => ({
          cookie: mockCookieFn,
        }),
      }),
    } as any;
  };

  const mockNext = {
    handle: jest.fn(),
  };

  it('should not refresh if there is no user in request', async () => {
    const context = getMockExecutionContext(undefined);
    await refreshInterceptor.intercept(context, mockNext);
    expect(authService.setAuthCookie).not.toHaveBeenCalled();
  });

  it('should refresh if there is a user in request', async () => {
    const context = getMockExecutionContext({
      id: 'testid',
      email: 'testemail',
    });
    await refreshInterceptor.intercept(context, mockNext);
    expect(authService.setAuthCookie).toHaveBeenCalledWith(
      context.switchToHttp().getResponse(),
      {
        userId: 'testid',
        email: 'testemail',
      },
    );
  });
});
