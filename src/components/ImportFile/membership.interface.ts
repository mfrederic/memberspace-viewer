export type PlanStatus = 
  | "active"
  | "expired"
  | "canceled"
  | "incomplete"
  | "willCancelOn";

export type MemberStatus = "approved" | "approved_manually" | "rejected" | "pending";

export type BooleanString = "yes" | "no";

export type Plan = {
  className: string;
  status: PlanStatus;
  date?: Date;
  text?: string;
}

export type Member = {
  ID: number;
  firstName: string;
  lastName: string;
  email: string;
  creationAt: Date;
  status: MemberStatus;
  notes: string;
  dancerName: string;
  address: string;
  timezone: string;
  mailingList: boolean;
  toExpiration?: Plan;
  plans: Plan[];
};

export type RawCsvMember = {
  ID: number;
  "First Name": string;
  "Last Name": string;
  Email: string;
  "Creation At": string;
  Status: MemberStatus;
  Notes: string;
  "What's your Dancer Name?": string;
  "What's your address?": string;
  "What's your Timezone?": string;
  "Allow us to add you to the mailing list and send you class info": BooleanString;
} & {
  [key: string]: PlanStatus | undefined;
};
