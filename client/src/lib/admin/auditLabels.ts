const ACTION_LABELS: Record<string, string> = {
  "admin.email_verified": "Email verified by admin",
  "admin.user_deactivated": "User account deactivated",
  "admin.user_activated": "User account activated",
  "admin.user_password_reset": "Password reset by admin",
  "admin.course_archived": "Course archived",
  "admin.coupon_created": "Coupon created",
  "admin.coupon_deactivated": "Coupon deactivated",
  "admin.help_article_created": "Help article created",
  "admin.help_article_updated": "Help article updated",
  "admin.help_article_edited": "Help article edited (published)",
  "admin.help_article_published": "Help article published",
  "admin.help_article_unpublished": "Help article unpublished",
  "admin.help_article_deleted": "Help article deleted",
  "admin.ticket_resolved": "Support ticket resolved",
  "admin.ticket_closed": "Support ticket closed",
  "admin.review_hidden": "Review hidden",
  "admin.review_restored": "Review restored",
  "support.question_asked": "FAQ escalation received",
  "support.question_resolved": "FAQ escalation resolved",
  "course.published": "Course published",
  "course.created": "Course created",
  "enrollment.created": "New enrollment",
  "purchase.completed": "Purchase completed",
  "user.registered": "New user registered",
};

export function getAuditActionLabel(action: string): string {
  if (ACTION_LABELS[action]) {
    return ACTION_LABELS[action];
  }

  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function metadataDetail(metadata: Record<string, unknown> | null | undefined): string | null {
  if (!metadata) return null;
  if (typeof metadata.courseTitle === "string") return metadata.courseTitle;
  if (typeof metadata.title === "string") return metadata.title;
  if (typeof metadata.code === "string") return `Code: ${metadata.code}`;
  if (typeof metadata.subject === "string") return metadata.subject;
  if (typeof metadata.question === "string") return metadata.question.slice(0, 80);
  return null;
}

export function getAuditEventDescription(event: {
  action: string;
  user?: { fullName: string } | null;
  entityType?: string | null;
  metadata?: Record<string, unknown> | null;
}): string {
  const label = getAuditActionLabel(event.action);
  const detail = metadataDetail(event.metadata as Record<string, unknown> | null);

  const actor = event.user?.fullName;
  if (actor && detail) return `${actor} - ${label}: ${detail}`;
  if (actor) return `${actor} - ${label}`;
  if (detail) return `${label}: ${detail}`;
  return label;
}

export const AUDIT_ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "admin", label: "Admin actions" },
  { value: "support", label: "Support & FAQ" },
  { value: "course", label: "Course actions" },
  { value: "enrollment", label: "Enrollment actions" },
  { value: "purchase", label: "Purchase actions" },
  { value: "user", label: "User actions" },
];
