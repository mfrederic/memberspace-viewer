import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export default dayjs;

const datePattern = /(\D{3}) \d{2}, \d{4} at (\d{2}:?){2} \D{2}/;

export function parseInputDate(date: string, raw = false): Date | undefined {
  if (!date) return undefined;
  if (raw) {
    const match = date.match(datePattern);
    if (match) {
      return dayjs(match[0], "MMM DD, YYYY at HH:mm A").toDate();
    }
    return undefined;
  }
  return dayjs(date, "MMM DD, YYYY at HH:mm A").toDate();
}
