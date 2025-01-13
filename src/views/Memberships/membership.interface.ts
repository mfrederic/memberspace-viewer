import type { Membership } from "@/core/database";

export interface MembershipItem extends Membership {
  _index: number;
  members: number;
  activeCount: number;
  inactiveCount: number;
  recurringCount: number;
  personsId: number[];
}