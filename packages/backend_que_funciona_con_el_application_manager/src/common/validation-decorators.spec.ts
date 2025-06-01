import { validate } from 'class-validator';
import { IsAfterProperty, IsSameDay, IsOneOf } from './validation-decorators';

class TestClassAfterProperty {
  @IsAfterProperty('startDate')
  endDate: Date;

  startDate: Date;

  constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

class TestClassSameDay {
  @IsSameDay('startDate')
  endDate: Date;

  startDate: Date;
  constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

class TestClassOneOf {
  @IsOneOf(['allowedValue1', 'allowedValue2'])
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

describe('IsAfterProperty', () => {
  it('should validate correctly', async () => {
    const instance = new TestClassAfterProperty(
      new Date('2022-01-01'),
      new Date('2022-01-02'),
    );
    const errors = await validate(instance);
    expect(errors).toHaveLength(0);
  });
});

describe('IsSameDay', () => {
  it('should validate correctly', async () => {
    const instance = new TestClassSameDay(
      new Date('2022-01-01'),
      new Date('2022-01-01'),
    );
    const errors = await validate(instance);
    expect(errors).toHaveLength(0);
  });
});

describe('IsOneOf', () => {
  it('should validate correctly', async () => {
    const instance = new TestClassOneOf('allowedValue1');
    const errors = await validate(instance);
    expect(errors).toHaveLength(0);
  });
});
