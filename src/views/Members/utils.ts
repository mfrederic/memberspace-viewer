import type { PlanEntity } from "@/core/interfaces/dataTypes";
import dayjs from "@/utils/date";

export function formatDate(date?: Date) {
  if (!date || !dayjs(date).isValid()) {
    return "";
  }
  return dayjs(date).format("YYYY-MM-DD");
}

export function classByDate(date?: Date) {
  if (!date || !dayjs(date).isValid()) {
    return "planUnknown";
  }
  return dayjs(date).isBefore(dayjs()) ? "planExpired" : "planOngoing";
}

export function statusColor(status: string) {
  switch (status) {
    case "approved":
    case "active - expires":
      return "green";
    case "approved_manually":
      return "lime-darken-2";
    case "expired":
      return "red";
    default:
      return "grey";
  }
}

export function statusToIcon(status: string) {
  switch (status) {
    case "approved":
    case "active - expires":
      return "mdi-check";
    case "approved_manually":
      return "mdi-check-circle";
    case "expired":
      return "mdi-close";
    default:
      return "mdi-help";
  }
}

export function yesNoChip(value: boolean) {
  return value ? "green" : "orange";
}

export function constructEmail(email: string) {
  return `mailto:${email}`;
}

export function handleLastPlan(lastPlan?: PlanEntity) {
  if (!lastPlan) {
    return {
      label: '',
      cssClass: '',
    }
  }
  switch (lastPlan.status) {
    case 'canceled':
      return {
        label: 'canceled',
        cssClass: 'text-yellow-darken-2',
      }
    case 'expired':
      return {
        label: dayjs(lastPlan.date).fromNow(),
        cssClass: 'text-red-accent-4'
      }
    case 'willCancelOn':
      return {
        label: dayjs().to(lastPlan.date),
        cssClass: (lastPlan.status.includes('cancels')) ? 'text-yellow-darken-2' : 'text-green-accent-4',
      }
    case 'active':
      return {
        label: 'recurring',
        cssClass: 'text-green-accent-4',
      }
    default:
      return {
        label: '',
        cssClass: '',
      }
  }
}