import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
  buildMessage,
} from 'class-validator';

export const IsAfterProperty = (
  property: string,
  options?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'IsAfterProperty',
      constraints: [property],
      validator: {
        validate: (value: Date, args: ValidationArguments): boolean => {
          if (!(value instanceof Date)) {
            return false;
          }

          const relatedPropertyName = args.constraints[0] as string;
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ] as Date;
          return value > relatedValue;
        },
        defaultMessage: buildMessage(
          (each: string): string =>
            each + '$property must be after $constraint1',
          options,
        ),
      },
    },
    options,
  );

export const IsSameDay = (
  property: string,
  options?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isSameDay',
      constraints: [property],
      validator: {
        validate: (value: Date, args: ValidationArguments): boolean => {
          if (!(value instanceof Date)) {
            return false;
          }
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ] as Date;
          return (
            value.getFullYear() === relatedValue.getFullYear() &&
            value.getMonth() === relatedValue.getMonth() &&
            value.getDate() === relatedValue.getDate()
          );
        },
        defaultMessage: buildMessage(
          (each: string): string =>
            each + '$property must be at same day as $constraint1',
          options,
        ),
      },
    },
    options,
  );

export const IsOneOf = (
  allowedValues: string[],
  options?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'IsOneOf',
      constraints: [allowedValues],
      validator: {
        validate: (value: string, args: ValidationArguments): boolean => {
          const [allowedValues] = args.constraints;
          return allowedValues.includes(value);
        },
        defaultMessage: buildMessage(
          (each: string): string =>
            each + '$property must be one of $constraint1',
          options,
        ),
      },
    },
    options,
  );
