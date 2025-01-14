import dayjs, { parseInputDate } from "@/utils/date";
import { type Member, type RawCsvMember, type PlanStatus } from "./membership.interface";
import Papa from "papaparse";

function parseStatus(raw: string): {
  status: PlanStatus;
  date?: Date;
  text: string;
} {
  const rawStatus = raw.toLowerCase() as PlanStatus;
  let status: PlanStatus = rawStatus;
  let date: Date | undefined;
  if (rawStatus.includes("cancels on") || rawStatus.includes("expires on")) {
    status = "willCancelOn";
    date = parseInputDate(raw, true);
  }
  if (rawStatus.includes("expired on")) {
    status = "expired";
    date = parseInputDate(raw, true);
  }
  if (rawStatus.includes("canceled")) {
    status = "canceled";
    date = parseInputDate(raw, true);
  }
  if (rawStatus.includes("incomplete")) {
    status = "incomplete";
    date = parseInputDate(raw, true);
  }
  return {
    status,
    date,
    text: raw,
  };
}

function parseTimezone(rawTimezone: string): string {
  return rawTimezone;
}

export function parseCsv(content: string): Member[] {
  const parsed = Papa.parse<RawCsvMember>(content, {
    header: true,
    delimiter: ",",
    skipEmptyLines: true,
    transform: (value) => value.trim(),
    transformHeader: (header: string) => header.trim(),
  });
  const members = parsed.data.map<Member>((raw) => {
    const {
      ID,
      "First Name": firstName,
      "Last Name": lastName,
      Email: email,
      "Creation At": creationAt,
      Status: status,
      Notes: notes,
      "What's your Dancer Name?": dancerName,
      "What's your address?": address,
      "What's your Timezone?": timezone,
      "Allow us to add you to the mailing list and send you class info": allowMailingList,
      ...subscriptions
    } = raw;
    const member: Member = {
      ID: raw.ID,
      firstName: raw["First Name"],
      lastName: raw["Last Name"],
      email: raw.Email,
      creationAt: parseInputDate(raw['Creation At']) as Date,
      status: raw.Status,
      notes: raw.Notes,
      dancerName: raw["What's your Dancer Name?"],
      address: raw["What's your address?"],
      timezone: parseTimezone(raw["What's your Timezone?"]),
      mailingList: raw["Allow us to add you to the mailing list and send you class info"] === "yes",
      plans: Object.entries(subscriptions)
        .filter(([_, value]) => !!value)
        .map(([name, rawValue]) => {
          const { status, date, text } = parseStatus(rawValue as string);
          return {
            className: name,
            status,
            date,
            text,
          };
        })
        .sort((a, b) => {
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
        }),
    };
    if (member.plans.length) {
      member.toExpiration = member.plans[0];
    }
    return member;
  });
  return members;
}