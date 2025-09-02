import { UnauthorizedException, BadRequestException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
    constructor() {
        super('Invalid credentials');
    }
}

export class EmailNotVerifiedException extends UnauthorizedException {
    constructor() {
        super('Email not verified');
    }
}

export class EmployerProfileNotFoundException extends UnauthorizedException {
    constructor() {
        super('Employer profile not found');
    }
}

export class GoogleLoginNotAllowedException extends BadRequestException {
    constructor() {
        super('Google login allowed for Job-Seeker only');
    }
}
