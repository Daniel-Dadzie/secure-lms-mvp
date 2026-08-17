import { Router } from 'express';
import { getPopularInstructors, getAllInstructors, getInstructorById } from './instructors.controller';

const router = Router();

// GET /api/instructors/popular
router.get('/popular', getPopularInstructors);

// GET /api/instructors
router.get('/', getAllInstructors);

// GET /api/instructors/:id
router.get('/:id', getInstructorById);

export default router;
