import { Request, Response } from "express";
import { getStudentDashboardData } from "./student.service";

 export async function getDashboardHandler(req: Request, res: Response) {
  try {
    // FIXED: Extracting 'sub' from the JwtPayload
    const userId = (req as any).user?.sub;

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