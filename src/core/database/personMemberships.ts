import type { PlanStatus } from "@/components/ImportFile/membership.interface";

export interface PersonsMemberships {
  personId: number;
  membershipId: number;
  status: PlanStatus;
  endDate?: Date;
}
