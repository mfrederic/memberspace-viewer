<script setup lang="ts">
import { observe } from "@/core/broadcast";
import { database } from "@/core/database";
import dayjs from "dayjs";
import type { Subscription } from "rxjs";
import { onBeforeUnmount } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";
import type { MembershipItem } from "./membership.interface";
import { headers, newHeaders } from "./headers";
import ClipboardCopy from '@/components/ClipboardCopy/ClipboardCopy.vue';
import { VDataTable } from 'vuetify/labs/VDataTable';

const memberships = ref<MembershipItem[]>([]);

const sorting = ref({
  key: "email",
  order: "natural",
});
function sortOrderIcon(key: keyof MembershipItem) {
  if (sorting.value.key === key) {
    switch (sorting.value.order) {
      case "asc":
        return "mdi-sort-ascending";
      case "desc":
        return "mdi-sort-descending";
      default:
        return "";
    }
  }
  return "";
}
function setSorting(
  key: keyof MembershipItem,
  dir?: "asc" | "desc" | "natural",
) {
  if (!dir) {
    if (sorting.value.key === key) {
      sorting.value.order =
        sorting.value.order === "asc"
          ? "desc"
          : sorting.value.order === "desc"
          ? "natural"
          : "asc";
    } else {
      sorting.value.key = key;
      sorting.value.order = "asc";
    }
  } else {
    sorting.value.key = key;
    sorting.value.order = dir;
  }

  memberships.value.sort((a, b) => {
    if (sorting.value.order === "natural") {
      return a._index - b._index;
    }
    const aValue = a[key];
    const bValue = b[key];
    if (aValue === undefined || bValue === undefined) {
      return 0;
    }
    if (aValue < bValue) {
      return sorting.value.order === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sorting.value.order === "asc" ? 1 : -1;
    }
    return 0;
  });
}

let subs: Subscription[] = [];
onBeforeUnmount(() => {
  subs.forEach((s) => s.unsubscribe());
});

onMounted(async () => {
  subs.push(
    observe("clearData").subscribe(() => {
      memberships.value = [];
    }),
    observe("loadData").subscribe(() => {
      init();
    }),
  );

  init();
});

async function init() {
  const membershipsList = await database.memberships.toArray();
  const personMembershipsList = await database.personMemberships.toArray();

  memberships.value = membershipsList.map((membership, index) => {
    const personMemberships = personMembershipsList.filter(
      (personMembership) => personMembership.membershipId === membership.id,
    );
    const members = personMemberships.length;
    const activeCount = personMemberships.filter(
      (personMembership) =>
        personMembership.endDate &&
        dayjs(personMembership.endDate).isAfter(dayjs()),
    ).length;
    const isInactive =
      membership.name.toLowerCase().includes("old") ||
      members - activeCount === members;
    return {
      _index: index,
      ...membership,
      members,
      activeCount,
      inactiveCount: members - activeCount,
      personsId: personMemberships.map(
        (personMembership) => personMembership.personId,
      ),
      active: membership.active && !isInactive,
    };
  });
  setSorting("active", "desc");
}
</script>
<template>
  <v-data-table
    items-per-page="25"
    :headers="newHeaders"
    :items="memberships">
    <template v-slot:item.name="{ item }">
      {{ item.raw.name }}
      <clipboard-copy :copy="item.raw.name" />
    </template>
    <template v-slot:item.members="{ item }">
      <v-chip size="x-large">{{ item.raw.members }}</v-chip>
    </template>
    <template v-slot:item.activeCount="{ item }">
      <v-chip
        size="x-large"
        :color="item.raw.activeCount > 0 ? 'green' : ''"
        >{{ item.raw.activeCount }}</v-chip
      >
    </template>
    <template v-slot:item.inactiveCount="{ item }">
      <v-chip
        size="x-large"
        :color="item.raw.inactiveCount > 0 ? 'red' : ''"
        >{{ item.raw.inactiveCount }}</v-chip
      >
    </template>
    <template v-slot:item.active="{ item }">
      <v-chip
        size="x-large"
        :color="item.raw.active ? 'green' : ''"
        >{{ item.raw.active ? 'active' : 'inactive' }}</v-chip
      >
    </template>
  </v-data-table>
</template>
<style scoped>
th {
  cursor: pointer;
}

.inactive {
  opacity: 0.5;
}
</style>
