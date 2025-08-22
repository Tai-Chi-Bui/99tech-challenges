import { Router } from 'express';
import { createAnimal, listAnimals, getAnimalById, updateAnimal, deleteAnimal } from '../controllers/animalController';
import { validateIdParam } from '../utils/validationUtils';

const router = Router();

/**
 * @swagger
 * /api/animals:
 *   post:
 *     tags:
 *       - Animals
 *     summary: Create a new animal
 *     description: Creates a new animal with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnimalRequest'
 *     responses:
 *       201:
 *         description: Animal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', createAnimal);

/**
 * @swagger
 * /api/animals:
 *   get:
 *     tags:
 *       - Animals
 *     summary: List animals with filters
 *     description: Retrieves a list of animals with optional filtering
 *     parameters:
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *         description: Filter by species
 *       - in: query
 *         name: breed
 *         schema:
 *           type: string
 *         description: Filter by breed
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of animals
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/', listAnimals);

/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     tags:
 *       - Animals
 *     summary: Get animal by ID
 *     description: Retrieves a specific animal by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Animal ID
 *     responses:
 *       200:
 *         description: Animal details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', validateIdParam, getAnimalById);

/**
 * @swagger
 * /api/animals/{id}:
 *   put:
 *     tags:
 *       - Animals
 *     summary: Update animal
 *     description: Updates an existing animal
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Animal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAnimalRequest'
 *     responses:
 *       200:
 *         description: Animal updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id', validateIdParam, updateAnimal);

/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     tags:
 *       - Animals
 *     summary: Delete animal
 *     description: Deletes an animal by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Animal ID
 *     responses:
 *       204:
 *         description: Animal deleted
 */
router.delete('/:id', validateIdParam, deleteAnimal);

export default router;
