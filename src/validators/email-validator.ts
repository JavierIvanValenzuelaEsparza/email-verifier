import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class EmailValidator implements ValidatorConstraintInterface {
  validate(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
  }

  defaultMessage() {
    return 'Email address is not valid';
  }
}

export function IsCustomEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailValidator,
    });
  };
}