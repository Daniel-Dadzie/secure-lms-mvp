import { Request, Response } from "express";
import { getStudentDashboardData } from "./student.service";

export async function getDashboardHandler(req: Request, res: Response) {
  try {
    // Assuming your auth middleware attaches the user object to req.user
    const userId = (req as any).user?.id || (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const dashboardData = await getStudentDashboardData(userId);
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}