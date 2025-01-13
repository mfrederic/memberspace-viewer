<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { MemberEntity } from "@/core/interfaces/dataTypes";
import type { MemberDataTable, SortIem } from "@/core/interfaces/DataTable";
import dayjs from "@/utils/date";
import { headers } from "./headers";
import { constructEmail, handleLastPlan } from "./utils";
import ClipboardCopy from "@/components/ClipboardCopy/ClipboardCopy.vue";

const props = defineProps<{
  members: MemberDataTable[];
  membershipFilter: "active" | "expired" | null;
  classesFilter: string[];
  textFilter: string;
}>();
const emit = defineEmits<{
  (e: 'selected', value: number[]): void;
  (e: 'selectUser', value: MemberEntity): void;
}>();

const router = useRouter();

const selected = ref<number[]>([]);
const sortBy = ref<SortIem[]>([{ key: 'calories', order: 'asc' }]);

function updateSortBy(event: SortIem[]) {
  const expirationDateSort = event.find((e) => e.key === 'toExpiration.date');
  if (expirationDateSort) {
    sortBy.value = event.concat([{ key: 'toExpiration.status', order: 'desc' }]);
    return;
  }
  sortBy.value = event;
}

function userLink(item: MemberEntity) {
  return router.resolve({
    path: `/${item._index}`,
    query: {
      membership: props.membershipFilter,
      classes: props.classesFilter,
    },
  }).href;
}
</script>

<template>
  <v-data-table
    :value="selected"
    v-model:sort-by="sortBy"
    show-select
    item-value="_index"
    items-per-page="25"
    :headers="headers"
    :items="members"
    :search="textFilter"
    :filter-keys="['name', 'email', 'dancerName', 'address', 'timezone']"
    @update:model-value="emit('selected', $event as number[])"
    @update:sort-by="updateSortBy">
    <template #item.name="{ item }">
      {{ item.firstName }} {{ item.lastName }}
    </template>
    <template #item.status="{ item }">
      <v-icon v-if="['approved', 'approved_manually'].includes(item.status)" color="success">mdi-check</v-icon>
    </template>
    <template #item.creationDate="{ item }">
      {{ dayjs(item.creationDate).fromNow() }}
      <v-tooltip activator="parent">
        {{ dayjs(item.creationDate).format('MM-DD-YYYY') }}
      </v-tooltip>
    </template>
    <template #item.mailingList="{ item }">
      <v-icon v-if="item.mailingList" color="success">mdi-check</v-icon>
    </template>
    <template #item.email="{ item }">
      <a :href="constructEmail(item.email.toString())">{{ item.email }}</a>
      <span class="float-right">
        <clipboard-copy
          alt="Copy email"
          size="small"
          :copy="item.email.toString()" />
      </span>
    </template>
    <template #item.address="{ item }">
      {{ item.address }}
      <span class="float-right">
        <v-btn
          class="mr-2"
          aria-label="Search in Google Maps"
          title="Search in Google Maps"
          size="small"
          variant="plain"
          density="compact"
          icon="mdi-map-marker"
          target="_blank"
          :href="`https://www.google.com/maps/search/${item.address}`" />
      </span>
    </template>
    <template #item.timezone="{ item }">
      {{ item.timezone }}
    </template>
    <template #item.plans.length="{ item }">
      <template v-if="item.plans.length > 0">
        <v-chip
          v-if="item.activePlans > 0"
          color="success"
          class="mr-1"
          density="compact">{{ item.activePlans }}</v-chip>
        <v-chip
          v-if="item.inactivePlans > 0"
          color="error"
          density="compact">{{ item.inactivePlans }}</v-chip>
      </template>
    </template>
    <template #item.toExpiration.status="{ item }">
      <b :class="handleLastPlan(item.toExpiration).cssClass">
        {{ handleLastPlan(item.toExpiration).label }}
        <template v-if="item.toExpiration">
          {{ item.toExpiration.status.includes('willCancelOn') ? '*' : '' }}
          <v-tooltip v-if="item.toExpiration.status.includes('willCancelOn')"
            activator="parent">
            Is planned to be canceled on {{ dayjs(item.toExpiration.date).format('MM-DD-YYYY') }}
          </v-tooltip>
        </template>
      </b>
    </template>
    <template #item.actions="{ item }">
      <v-btn variant="plain" :to="userLink(item)" @click="emit('selectUser', item)">
        More
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>