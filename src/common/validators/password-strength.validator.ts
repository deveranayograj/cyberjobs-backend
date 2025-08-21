import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordStrengthConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string) {
    if (!password) return false;
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return strongPasswordRegex.test(password);
  }

  defaultMessage() {
    return 'Password must be at least 6 characters, include 1 uppercase letter and 1 number';
  }
}
export function PasswordStrength(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordStrengthConstraint,
    });
  };
}
