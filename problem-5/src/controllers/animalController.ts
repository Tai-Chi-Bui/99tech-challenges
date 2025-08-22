import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateAnimalRequest, UpdateAnimalRequest, AnimalFilters } from '../types';
import { sendCreated, sendPaginated, sendSuccess, sendNoContent, sendValidationError, sendInternalError, sendNotFound } from '../utils/responseUtils';
import { validatePagination, buildWhereClause, validateCreateRequest, validateUpdateRequest } from '../utils/validationUtils';
import { logError } from '../utils/logger';

const prisma = new PrismaClient();

// Extend Request interface to include validatedId
interface ValidatedRequest extends Request {
  validatedId?: number;
}

export async function createAnimal(req: Request, res: Response): Promise<void> {
  try {
    const animalData: CreateAnimalRequest = req.body;
    
    const validation = validateCreateRequest(animalData);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors.join('; '), req.path);
      return;
    }

    const animal = await prisma.animal.create({
      data: animalData
    });

    sendCreated(res, animal, 'Animal created successfully');
  } catch (error) {
    logError('Error creating animal', error, { path: req.path, body: req.body });
    sendInternalError(res, 'Failed to create animal', req.path);
  }
}

export async function listAnimals(req: Request, res: Response): Promise<void> {
  try {
    const filters: AnimalFilters = req.query;
    const { limit, offset } = validatePagination(
      filters.limit?.toString(), 
      filters.offset?.toString()
    );
    
    const where = buildWhereClause(filters);

    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.animal.count({ where })
    ]);

    sendPaginated(res, animals, total, limit, offset);
  } catch (error) {
    logError('Error listing animals', error, { path: req.path, query: req.query });
    sendInternalError(res, 'Failed to list animals', req.path);
  }
}

export async function getAnimalById(req: ValidatedRequest, res: Response): Promise<void> {
  try {
    const id = req.validatedId!;

    const animal = await prisma.animal.findUnique({
      where: { id }
    });

    if (!animal) {
      sendNotFound(res, 'Animal not found', req.path);
      return;
    }

    sendSuccess(res, animal, 'Animal retrieved successfully');
  } catch (error) {
    logError('Error getting animal', error, { path: req.path, id: req.validatedId });
    sendInternalError(res, 'Failed to get animal', req.path);
  }
}

export async function updateAnimal(req: ValidatedRequest, res: Response): Promise<void> {
  try {
    const id = req.validatedId!;
    const updateData: UpdateAnimalRequest = req.body;

    const validation = validateUpdateRequest(updateData);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors.join('; '), req.path);
      return;
    }

    const existingAnimal = await prisma.animal.findUnique({
      where: { id }
    });

    if (!existingAnimal) {
      sendNotFound(res, 'Animal not found', req.path);
      return;
    }

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: updateData
    });

    sendSuccess(res, updatedAnimal, 'Animal updated successfully');
  } catch (error) {
    logError('Error updating animal', error, { path: req.path, id: req.validatedId, body: req.body });
    sendInternalError(res, 'Failed to update animal', req.path);
  }
}

export async function deleteAnimal(req: ValidatedRequest, res: Response): Promise<void> {
  try {
    const id = req.validatedId!;

    const existingAnimal = await prisma.animal.findUnique({
      where: { id }
    });

    if (!existingAnimal) {
      sendNotFound(res, 'Animal not found', req.path);
      return;
    }

    await prisma.animal.delete({
      where: { id }
    });

    sendNoContent(res);
  } catch (error) {
    logError('Error deleting animal', error, { path: req.path, id: req.validatedId });
    sendInternalError(res, 'Failed to delete animal', req.path);
  }
}
