import dayjs from "dayjs";

export function elapsed(date?: Date) {
  if (!date || !dayjs(date).isValid()) {
    return { label: "", cssClass: "" };
  }
  const today = new Date();
  return dayjs(date).isBefore(today)
    ? { label: dayjs(date).fromNow(), cssClass: "date-passed" }
    : { label: dayjs().to(date), cssClass: "date-future" };
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}