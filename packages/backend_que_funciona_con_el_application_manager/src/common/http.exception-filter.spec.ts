import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http.exception-filter';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

const mockAppLoggerService = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};
const mockJson = jest.fn();
const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));
const mockGetResponse = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));

const mockGetRequest = jest.fn().mockImplementation(() => ({
  headers: {
    'x-lang': 'es',
  },
}));
const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: mockGetRequest,
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};
describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let i18n: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        {
          provide: I18nService,
          useValue: {
            translate: jest
              .fn()
              .mockImplementation((key, opts) => `translated-${key}`),
          },
        },
      ],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    i18n = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch exception and return translated message', () => {
    const exception = new BadRequestException('Test Exception');
    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'translated-Test Exception',
        statusCode: HttpStatus.BAD_REQUEST,
      }),
    );
  });
});
