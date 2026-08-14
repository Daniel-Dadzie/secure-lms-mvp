export interface SupportTicketSummary {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}
