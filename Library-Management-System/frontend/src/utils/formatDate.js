import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

// ── Standard formats ──────────────────────────────────────────────────────
export const formatDate = (date) =>
    date ? format(new Date(date), "dd MMM yyyy") : "—";

export const formatDateTime = (date) =>
    date ? format(new Date(date), "dd MMM yyyy, hh:mm a") : "—";

export const formatShortDate = (date) =>
    date ? format(new Date(date), "dd/MM/yyyy") : "—";

// ── Relative time ─────────────────────────────────────────────────────────
// e.g. "3 days ago", "in 5 days"
export const timeAgo = (date) =>
    date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : "—";

// ── Due date helpers ──────────────────────────────────────────────────────
export const isOverdue = (dueDate) =>
    dueDate ? isPast(new Date(dueDate)) : false;

export const daysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    return days;
};

// returns a human label for due date status
// e.g. "Due today", "3 days left", "Overdue by 5 days"
export const dueDateLabel = (dueDate) => {
    if (!dueDate) return "—";
    const days = daysUntilDue(dueDate);

    if (days === 0)  return "Due today";
    if (days > 0)    return `${days} ${days === 1 ? "day" : "days"} left`;
    return `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"}`;
};