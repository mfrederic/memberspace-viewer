import type { RouteRecordRaw } from "vue-router";

export enum RouteName {
  Members = 'Members',
  Member = 'Member',
  Memberships = 'Memberships',
  Membership = 'Membership',
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: RouteName.Members,
    component: () => import("../views/Members/Members.vue"),
    children: [
      {
        path: ":id",
        name: RouteName.Member,
        component: () => import("../components/MemberCard/MemberCard.vue"),
      }
    ],
  },
  {
    path: "/memberships",
    name: RouteName.Memberships,
    component: () => import("../views/Memberships/Memberships.vue"),
    children: [
      {
        path: ":id",
        name: RouteName.Membership,
        component: () => import("../components/MembershipsCard/MembershipsCard.vue"),
      }
    ],
  },
];
