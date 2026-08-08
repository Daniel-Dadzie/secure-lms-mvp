import { Router } from 'express';
import { getInstructorById } from './instructors.controller';

const router = Router();

// GET /api/instructors/:id
router.get('/:id', getInstructorById);

export default router;