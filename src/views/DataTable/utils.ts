import type { ClassItem } from "@/core/interfaces/dataTypes";
import dayjs from "dayjs";

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

export function handleLastPlan(lastPlan?: ClassItem) {
  if (!lastPlan) {
    return {
      label: '',
      cssClass: '',
    }
  }
  if (lastPlan.status === 'canceled') {
    return {
      label: 'canceled',
      cssClass: '',
    }
  } else if (lastPlan.status === 'expired') {
    return {
      label: dayjs(lastPlan.date).fromNow(),
      cssClass: 'date-passed'
    }
  } else if(lastPlan.status.includes('active -')) {
    return {
      label: dayjs().to(lastPlan.date),
      cssClass: (lastPlan.status.includes('cancels')) ? 'date-canceled' : 'date-future',
    }
  } else if (lastPlan.status === 'active') {
    return {
      label: 'recurring',
      cssClass: 'date-future',
    }
  } else {
    return {
      label: '',
      cssClass: '',
    }
  }
}