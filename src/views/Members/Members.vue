<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, type LocationQueryRaw } from "vue-router";
import dayjs from "@/utils/date";
import { database } from "@/core/database";
import { dbToDataType } from "@/core/database/dbToDataType";
import { observe } from "@/core/broadcast";
import { extractClasses } from "@/core/utils/mapper";

import DataFilters from "./DataFilters/DataFilters.vue";
import MembersTable from "./MembersTable.vue";
import SelectionActions from "./SelectionActions.vue";

import type { Subscription } from "rxjs";
import type { MemberEntity } from "@/core/interfaces/dataTypes";
import type { Filters } from "./DataFilters/DataFilters.vue";
import type { PlanStatus } from "@/components/ImportFile/membership.interface";

const route = useRoute();
const router = useRouter();

const membershipFilter = ref<"active" | "expired" | null>(route.query.membership as "active" | "expired" | null ?? 'expired');
const classesFilter = ref<string[]>(route.query.classes as string[] ?? []);
const userView = ref<boolean>(route.params.id !== undefined);
const textFilter = ref<string>('');
const hideNoMembership = ref<boolean>(!!route.query.hideNoMembership);
const persons = ref<MemberEntity[]>([]);
const loading = ref<boolean>(false);
const selected = ref<number[]>([]);

let subs: Subscription[] = [];
onBeforeUnmount(() => {
  subs.forEach((s) => s.unsubscribe());
});

onMounted(async () => {
  subs.push(
    observe("clearData").subscribe(() => {
      persons.value = [];
    }),
    observe("loadData").subscribe(() => {
      init();
    }),
  );
  init();
});

function selectUser() {
  userView.value = true;
}

async function init() {
  loading.value = true;
  const personsList = await database.persons
    .orderBy('[firstname+lastname]')
    .toArray();
  const membershipsList = await database.memberships
    .toArray();
  const personMembershipsList = await database.personMemberships
    .toArray();

  persons.value = dbToDataType(personsList, membershipsList, personMembershipsList);
  loading.value = false;
}

const members = computed(() => {
  function getMembership(member: MemberEntity) {
    let membership = false;
    if (membershipFilter.value === null) {
      return true;
    }

    if (membershipFilter.value === "active") {
      const acceptedStatus: PlanStatus[] = ['active', 'willCancelOn'];
      membership = member.toExpiration !== undefined 
        && (acceptedStatus.includes(member.toExpiration.status)
          || (member.toExpiration.date !== undefined && dayjs(member.toExpiration.date).isAfter(dayjs())));
    } else {
      membership =
        !member.toExpiration || dayjs(member.toExpiration?.date).isBefore(dayjs()) || member.toExpiration.status === 'active';
    }
    return membership;
  }

  function getClasses(member: MemberEntity) {
    if (classesFilter.value.length === 0) {
      return true;
    }
    return member.plans.some((c) =>
      classesFilter.value.includes(c.className),
    );
  }

  function getHideNoMembership(member: MemberEntity) {
    if (hideNoMembership.value) {
      return member.plans.length > 0;
    }
    return true;
  }

  const memberList = persons.value
    .filter((item) => getClasses(item) && getMembership(item) && getHideNoMembership(item))
    .map((member) => ({
      ...member,
      activePlans: member.plans.filter((p) => ['active', 'willCancelOn'].includes(p.status)).length,
      inactivePlans: member.plans.filter((p) => !['active', 'willCancelOn'].includes(p.status)).length,
    }));
  return memberList;
});

const selectedMembers = computed(() => persons.value.filter((item) => selected.value.includes(item._index)));

const classes = computed(() => {
  return extractClasses(persons.value);
});

function filter(filter: Partial<Filters>) {
  let query: LocationQueryRaw = {};
  if (filter.membership !== undefined) {
    membershipFilter.value = filter.membership;
    if (filter.membership !== null) {
      query.membership = filter.membership;
    }
  }
  if (filter.selectedClasses !== undefined) {
    classesFilter.value = filter.selectedClasses;
    if (filter.selectedClasses.length > 0) {
      query.classes = filter.selectedClasses;
    }
  }
  if (filter.text !== undefined) {
    textFilter.value = filter.text;
    if (filter.text !== '') {
      query.text = filter.text;
    }
  }
  if (filter.hideNoMembership !== undefined) {
    hideNoMembership.value = filter.hideNoMembership;
    if (filter.hideNoMembership) {
      query.hideNoMembership = '';
    }
  }
  router.push({
    query,
  });
}
</script>

<template>
  <DataFilters
    :filters="{
      membership: membershipFilter,
      selectedClasses: classesFilter,
      text: textFilter,
      hideNoMembership: hideNoMembership,
    }"
    :classes="classes"
    :count="members.length"
    :total="persons.length"
    @filter="filter"
  />
  <template v-if="loading">
    <v-progress-linear indeterminate color="primary" :height="12"></v-progress-linear>
  </template>
  <members-table
    :members="members"
    :membershipFilter="membershipFilter"
    :classesFilter="classesFilter"
    :textFilter="textFilter"
    @selected="selected = $event"
    @selectUser="selectUser()"
  />
  <selection-actions
    :selected="selectedMembers"
  />
  <v-dialog 
    v-model="userView"
    width="auto"
    min-width="650px">
    <RouterView />
  </v-dialog>
</template>
