import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { UserRole } from '@prisma/client';
import { BLOCKED_EMAIL_DOMAINS } from '@common/config/blocked-domains.config';

interface RoleAware {
  role: UserRole;
}

@ValidatorConstraint({ async: false })
export class EmployerEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    if (!email) return false;

    const obj = args.object as RoleAware;
    const role = obj.role;

    if (role === UserRole.EMPLOYER) {
      const domain = email.split('@')[1]?.toLowerCase();
      return domain ? !BLOCKED_EMAIL_DOMAINS.includes(domain) : false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Employer email cannot be from free/public providers (e.g., Gmail, Yahoo, Outlook)';
  }
}

export function EmployerEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmployerEmailConstraint,
    });
  };
}
