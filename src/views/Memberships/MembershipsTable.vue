<script setup lang="ts">
import { onBeforeUnmount, ref, onMounted } from "vue";
import type { Subscription } from "rxjs";
import dayjs from "@/utils/date";
import { observe } from "@/core/broadcast";
import { database } from "@/core/database";
import type { MembershipItem } from "./membership.interface";
import { headers } from "./headers";
import ClipboardCopy from '@/components/ClipboardCopy/ClipboardCopy.vue';

const emit = defineEmits({
  'selectMembership': (item: MembershipItem) => true,
});

const memberships = ref<MembershipItem[]>([]);

const sorting = ref({
  key: "email",
  order: "natural",
});

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
  const membershipsList = await database.memberships
    .orderBy('name')
    .toArray();
  const personMembershipsList = await database.personMemberships
    .orderBy('personId')
    .toArray();

  memberships.value = membershipsList.map((membership, index) => {
    const personMemberships = personMembershipsList.filter(
      (personMembership) => personMembership.membershipId === membership.id,
    );
    const members = personMemberships.length;
    const multipleCounts = personMemberships.reduce((acc, personMembership) => {
      if (['active', 'willCancelOn'].includes(personMembership.status)) {
        if (personMembership.status === 'active') {
          acc.recurringCount++;
          acc.activeCount++;
        }
        if (personMembership.endDate && dayjs(personMembership.endDate).isAfter(dayjs())) {
          acc.activeCount++;
        }
        return acc;
      }
      acc.inactiveCount++;
      return acc;
    }, { recurringCount: 0, activeCount: 0, inactiveCount: 0 });

    const isInactive =
      membership.name.toLowerCase().includes("old") ||
      members - multipleCounts.activeCount === members;
    return {
      _index: index,
      ...membership,
      members,
      activeCount: multipleCounts.activeCount,
      inactiveCount: members - multipleCounts.activeCount,
      recurringCount: multipleCounts.recurringCount,
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
    :headers="headers"
    :items="memberships"
    :filter-keys="['name', 'active', 'members', 'activeCount', 'inactiveCount', 'recurringCount']">
    <template #item.name="{ item }">
      {{ item.name }}
      <clipboard-copy :copy="item.name" />
    </template>
    <template #item.active="{ item }">
      <v-icon v-if="item.active" color="success">mdi-check</v-icon>
    </template>
    <template #item.members="{ item }">
      <v-chip>{{ item.members }}</v-chip>
    </template>
    <template #item.recurringCount="{ item }">
      <v-chip
        :color="item.recurringCount > 0 ? 'green' : ''"
        >{{ item.recurringCount }}</v-chip
      >
    </template>
    <template #item.activeCount="{ item }">
      <v-chip
        :color="item.activeCount > 0 ? 'green' : ''"
        >{{ item.activeCount }}</v-chip
      >
    </template>
    <template #item.inactiveCount="{ item }">
      <v-chip
        :color="item.inactiveCount > 0 ? 'red' : ''"
        >{{ item.inactiveCount }}</v-chip
      >
    </template>
    <template #item.actions="{ item }">
      <v-btn
        variant="plain"
        :to="`/memberships/${item.id}`"
        @click="emit('selectMembership', item)">
        More
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>
