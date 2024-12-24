import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Custom Validator: Check if the backup code is in the correct format
@ValidatorConstraint({ async: false })
class IsBackupCodeConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // The pattern for backup codes: XXXXX-XXXXX (5 alphanumeric characters, a dash, and 5 alphanumeric characters)
    const regex = /^[a-zA-Z]{5}-[a-zA-Z]{5}$/;
    return regex.test(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'The backup code must be in the format "XXXXX-XXXXX".';
  }
}

// Create a custom decorator for backup code format validation
export function IsBackupCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBackupCodeConstraint,
    });
  };
}
