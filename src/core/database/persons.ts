import type { MemberStatus } from "@/components/ImportFile/membership.interface";

export interface Person {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  status: MemberStatus;
  timezone: string;
  mailingList: boolean;
  address: string;
  dancerName: string;
  creationDate: Date;
}
