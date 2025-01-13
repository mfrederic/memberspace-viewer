import type { MemberEntity } from "./dataTypes";

export type SortIem = {
  key: string;
  order: 'asc' | 'desc';
}

export interface MemberDataTable extends MemberEntity {
  activePlans: number;
  inactivePlans: number;
}
