import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserRole } from '@prisma/client';

interface RoleAware {
  role: UserRole;
}

@ValidatorConstraint({ async: false })
export class EmployerEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    if (!email) return false;

    // Cast object to RoleAware to safely access role
    const obj = args.object as RoleAware;
    const role = obj.role;

    // Only validate if role is EMPLOYER
    if (role === UserRole.EMPLOYER) {
      const forbiddenDomains = ['google.com', 'yahoo.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      return !forbiddenDomains.includes(domain);
    }

    // If role is SEEKER, allow any email
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Employer email cannot be from google.com or yahoo.com';
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
