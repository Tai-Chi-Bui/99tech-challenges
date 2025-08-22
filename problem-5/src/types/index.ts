export interface CreateAnimalRequest {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  size?: AnimalSize;
  location?: string;
  description?: string;
}

export interface UpdateAnimalRequest {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  size?: AnimalSize;
  location?: string;
  description?: string;
}

export interface Animal {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  size?: AnimalSize;
  location?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnimalFilters {
  species?: string;
  breed?: string;
  age?: number;
  size?: AnimalSize;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
}

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0
} as const;

export const ANIMAL_SIZES = ['small', 'medium', 'large'] as const;
export type AnimalSize = typeof ANIMAL_SIZES[number];

export const ANIMAL_AGE_LIMITS = {
  MIN: 0,
  MAX: 50
} as const;

export const VALIDATION_MESSAGES = {
  NAME_REQUIRED: 'Name is required and cannot be empty',
  SPECIES_REQUIRED: 'Species is required and cannot be empty',
  AGE_RANGE: `Age must be between ${ANIMAL_AGE_LIMITS.MIN} and ${ANIMAL_AGE_LIMITS.MAX} years`,
  INVALID_SIZE: 'Size must be one of: small, medium, large',
  AT_LEAST_ONE_FIELD: 'At least one field must be provided for update',
  ID_INVALID: 'Invalid ID parameter - must be a positive integer'
} as const;
