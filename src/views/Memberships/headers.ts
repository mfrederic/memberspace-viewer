import type { HeaderItem } from "@/core/constants/headers";
import { ref } from "vue";
import type { MembershipItem } from "./membership.interface";

export const newHeaders = ref([
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Members',
    key: 'members',
  },
  {
    title: 'Active members',
    key: 'activeCount',
  },
  {
    title: 'Inactive members',
    key: 'inactiveCount',
  },
  {
    title: 'Active',
    key: 'active',
  },
])

export const headers = ref<HeaderItem<MembershipItem>[]>([
  {
    key: "name",
    label: "Name",
  },
  {
    key: "members",
    label: "Members",
  },
  {
    key: "activeCount",
    label: "Active members",
  },
  {
    key: "inactiveCount",
    label: "Inactive members",
  },
  {
    key: "active",
    label: "Active",
  },
]);