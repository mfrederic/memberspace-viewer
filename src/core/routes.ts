import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/DataTable/DataTable.vue"),
    children: [
      {
        path: "/:id",
        name: "Details",
        component: () => import("../components/MemberCard/MemberCard.vue"),
      }
    ],
  },
  {
    path: "/memberships",
    name: "Memberships",
    component: () => import("../views/Memberships/Memberships.vue"),
  },
];
