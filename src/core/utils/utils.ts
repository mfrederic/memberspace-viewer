import dayjs from "@/utils/date";

export function elapsed(date?: Date) {
  if (!date || !dayjs(date).isValid()) {
    return { label: "", cssClass: "" };
  }
  const today = new Date();
  return dayjs(date).isBefore(today)
    ? { label: dayjs(date).fromNow(), cssClass: "text-red-accent-4" }
    : { label: dayjs().to(date), cssClass: "text-green-accent-4" };
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}