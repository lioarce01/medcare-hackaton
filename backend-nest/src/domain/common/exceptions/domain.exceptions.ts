export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`, 'ENTITY_NOT_FOUND', 404);
  }
}

export class UnauthorizedAccessException extends DomainException {
  constructor(resource: string) {
    super(`Unauthorized access to ${resource}`, 'UNAUTHORIZED_ACCESS', 403);
  }
}

export class InvalidEntityStateException extends DomainException {
  constructor(entityName: string, currentState: string, expectedState: string) {
    super(
      `${entityName} is in ${currentState} state, expected ${expectedState}`,
      'INVALID_ENTITY_STATE',
      400,
    );
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422);
  }
}
