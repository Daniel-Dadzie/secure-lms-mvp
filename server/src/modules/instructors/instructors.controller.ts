import { Request, Response } from 'express';
import * as instructorsService from './instructors.service';

export async function getInstructorById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const profile = await instructorsService.getInstructorProfile(id as string);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found or inactive',
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching instructor profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor profile',
    });
  }
}