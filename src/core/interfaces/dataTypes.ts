import type { MemberStatus, PlanStatus } from "@/components/ImportFile/membership.interface";


export interface PlanEntity {
  className: string;
  status: PlanStatus;
  date?: Date;
}

export interface MemberEntity {
  _index: number;
  firstName: string;
  lastName: string;
  email: string;
  status: MemberStatus;
  dancerName: string;
  address: string;
  timezone: string;
  mailingList: boolean;
  plans: PlanEntity[];
  toExpiration?: PlanEntity;
  creationDate: Date;
}
