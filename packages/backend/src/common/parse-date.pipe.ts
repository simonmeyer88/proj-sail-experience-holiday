import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: (string | Date) | (() => string | Date) | undefined | null) {
    if (!value) throw new BadRequestException('Date is required');
    if (typeof value === 'function') {
      value = value();
    }
    const transformedValue = new Date(value);
    if (isNaN(transformedValue.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return transformedValue;
  }
}
