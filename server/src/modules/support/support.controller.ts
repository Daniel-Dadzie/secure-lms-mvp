import type { Request, Response, NextFunction } from "express";
import * as supportService from "./support.service";
import * as ticketsUserService from "./support-tickets.service";
import { z } from "zod";
import { createUserTicketSchema, userTicketReplySchema } from "../instructor-portal/instructor-portal.schemas";

const askSchema = z.object({
  question: z
    .string()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question cannot exceed 500 characters")
    .trim(),
});

export async function ask(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = askSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = (req as any).user?.sub;
    const result = await supportService.askSupport(parsed.data.question, userId);
    res.status(200).json(result);
  } catch (error) { next(error); }
}

export async function createTicket(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = createUserTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user.sub;
    const ticket = await ticketsUserService.createUserTicket({
      userId,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });
    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
}

export async function listMyTickets(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const tickets = await ticketsUserService.listUserTickets(userId);
    res.status(200).json({ tickets });
  } catch (error) {
    next(error);
  }
}

export async function getMyTicket(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const ticket = await ticketsUserService.getUserTicket(req.params.ticketId as string, userId);
    res.status(200).json({ ticket });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }
    next(error);
  }
}

export async function replyToMyTicket(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = userTicketReplySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user.sub;
    const message = await ticketsUserService.replyToUserTicket(
      req.params.ticketId as string,
      userId,
      parsed.data.body
    );
    res.status(201).json({ message });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }
    if (error.statusCode === 403) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    next(error);
  }
}
