import { classes } from "@/core/constants/headers";
import type { ClassItem, DataType } from "@/core/interfaces/dataTypes";
import dayjs from "dayjs";

function createEntry(item: Record<string, string>, index: number): DataType {
  return {
    _index: index,
    firstName: item["First Name"],
    lastName: item["Last Name"],
    email: item["Email"],
    status: item["Status"],
    dancerName: item["What's your Dancer Name?"],
    address: item["What's your address? "],
    timezone: item["What's your Timezone?"],
    mailingList:
      item[
        "Allow us to add you to the mailing list and send you class info"
      ] === "yes",
    plans: [],
    toExpiration: undefined,
    creationDate: dayjs(item['Creation At'], "YYYY-MM-DD HH:mm").toDate(),
  };
}

export function csvToDataType(data: Record<string, string>[]): DataType[] {
  return data.reduce((acc, item, index) => {
    const current: DataType = createEntry(item, index);
    classes.forEach((className) => {
      const itemValue = item[className];
      if (itemValue && itemValue !== undefined) {
        const extra = (itemValue as string).split(" on ");
        const value = {
          className,
          status: extra[0].toLowerCase(),
          date: extra[1] ? new Date(extra[1]) : undefined,
        };
        current.plans.push(value);
      }
    });
    (current.plans as ClassItem[]).sort((a, b) => {
      if (a.status !== 'active') {
        return 1;
      }
      if (b.status !== 'active') {
        return -1;
      }
      if (!dayjs(a.date).isValid()) {
        return 1;
      }
      if (!dayjs(b.date).isValid()) {
        return -1;
      }
      return dayjs(a.date, "YYYY-MM-DD HH:mm").isBefore(
        dayjs(b.date, "YYYY-MM-DD HH:mm"),
      )
        ? 1
        : -1;
    });
    current.toExpiration = current.plans.length > 0 ? current.plans[0] : undefined;
    return [...acc, current];
  }, [] as DataType[]);
}
