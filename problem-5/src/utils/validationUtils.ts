import { Request, Response, NextFunction } from 'express';
import { PAGINATION, ANIMAL_SIZES, ANIMAL_AGE_LIMITS, VALIDATION_MESSAGES, AnimalSize, CreateAnimalRequest, UpdateAnimalRequest, AnimalFilters } from '../types';
import { sendValidationError } from './responseUtils';

export function validateId(id: string): number | null {
  if (!id || typeof id !== 'string') return null;
  const parsedId = parseInt(id.trim(), 10);
  return isNaN(parsedId) || parsedId <= 0 ? null : parsedId;
}

export function validatePagination(limit?: string, offset?: string): { limit: number; offset: number } {
  const parsedLimit = limit ? parseInt(limit.trim(), 10) : PAGINATION.DEFAULT_LIMIT;
  const parsedOffset = offset ? parseInt(offset.trim(), 10) : PAGINATION.DEFAULT_OFFSET;

  return {
    limit: Math.min(Math.max(parsedLimit, 1), PAGINATION.MAX_LIMIT),
    offset: Math.max(parsedOffset, 0)
  };
}

export function validateAnimalSize(size?: string): size is AnimalSize {
  if (!size || typeof size !== 'string') return false;
  return ANIMAL_SIZES.includes(size.trim().toLowerCase() as AnimalSize);
}

export function validateAge(age?: string | number): number | null {
  if (age === undefined || age === null) return null;
  
  const ageStr = age.toString().trim();
  const parsedAge = parseInt(ageStr, 10);
  
  if (isNaN(parsedAge) || parsedAge < ANIMAL_AGE_LIMITS.MIN || parsedAge > ANIMAL_AGE_LIMITS.MAX) {
    return null;
  }
  return parsedAge;
}

export function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const sanitized = value.trim();
  return sanitized.length > 0 ? sanitized : null;
}

export function buildWhereClause(filters: AnimalFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  
  const species = sanitizeString(filters.species);
  if (species) {
    where.species = species;
  }
  
  const breed = sanitizeString(filters.breed);
  if (breed) {
    where.breed = breed;
  }
  
  if (filters.size && validateAnimalSize(filters.size)) {
    where.size = filters.size.trim().toLowerCase();
  }
  
  const location = sanitizeString(filters.location);
  if (location) {
    where.location = location;
  }
  
  const age = validateAge(filters.age);
  if (age !== null) {
    where.age = age;
  }
  
  return where;
}

export function validateCreateRequest(data: CreateAnimalRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const name = sanitizeString(data.name);
  if (!name) {
    errors.push(VALIDATION_MESSAGES.NAME_REQUIRED);
  }
  
  const species = sanitizeString(data.species);
  if (!species) {
    errors.push(VALIDATION_MESSAGES.SPECIES_REQUIRED);
  }
  
  if (data.age !== undefined) {
    const age = validateAge(data.age);
    if (age === null) {
      errors.push(VALIDATION_MESSAGES.AGE_RANGE);
    }
  }
  
  if (data.size !== undefined && !validateAnimalSize(data.size)) {
    errors.push(VALIDATION_MESSAGES.INVALID_SIZE);
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateUpdateRequest(data: UpdateAnimalRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const hasFields = Object.keys(data).some(key => data[key as keyof UpdateAnimalRequest] !== undefined);
  
  if (!hasFields) {
    errors.push(VALIDATION_MESSAGES.AT_LEAST_ONE_FIELD);
    return { isValid: false, errors };
  }
  
  if (data.name !== undefined) {
    const name = sanitizeString(data.name);
    if (!name) {
      errors.push(VALIDATION_MESSAGES.NAME_REQUIRED);
    }
  }
  
  if (data.age !== undefined) {
    const age = validateAge(data.age);
    if (age === null) {
      errors.push(VALIDATION_MESSAGES.AGE_RANGE);
    }
  }
  
  if (data.size !== undefined && !validateAnimalSize(data.size)) {
    errors.push(VALIDATION_MESSAGES.INVALID_SIZE);
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  const idParam = req.params.id;
  if (!idParam) {
    sendValidationError(res, VALIDATION_MESSAGES.ID_INVALID, req.path);
    return;
  }
  
  const id = validateId(idParam);
  if (id === null) {
    sendValidationError(res, VALIDATION_MESSAGES.ID_INVALID, req.path);
    return;
  }
  
  // Store the validated ID for use in controllers
  (req as any).validatedId = id;
  next();
}
