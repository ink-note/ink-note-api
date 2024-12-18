import { isCuid } from '@paralleldrive/cuid2';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Define the validation logic
@ValidatorConstraint({ async: false })
class IsCuidConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments): boolean {
    return typeof value === 'string' && isCuid(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'The value must be a valid CUID.';
  }
}

// Create a custom decorator
export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCuidConstraint,
    });
  };
}
