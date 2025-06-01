import { ParseDatePipe } from './parse-date.pipe';
import { BadRequestException } from '@nestjs/common';

describe('ParseDatePipe', () => {
  let parseDatePipe: ParseDatePipe;

  beforeEach(() => {
    parseDatePipe = new ParseDatePipe();
  });

  it('should throw an error if no date is provided', () => {
    expect(() => parseDatePipe.transform(undefined)).toThrow(
      BadRequestException,
    );
    expect(() => parseDatePipe.transform(null)).toThrow(BadRequestException);
  });

  it('should throw an error if an invalid date is provided', () => {
    expect(() => parseDatePipe.transform('invalid date')).toThrow(
      BadRequestException,
    );
  });

  it('should return a Date object if a valid date string is provided', () => {
    const date = '2022-01-01';
    const result = parseDatePipe.transform(date);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(new Date(date).toISOString());
  });

  it('should return a Date object if a valid date function is provided', () => {
    const date = () => '2022-01-01';
    const result = parseDatePipe.transform(date);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(new Date(date()).toISOString());
  });
});
