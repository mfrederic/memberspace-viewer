<script setup lang="ts">
import type { ClassItem, DataType } from "@/core/interfaces/dataTypes";
import dayjs from "dayjs";
import ClipboardCopy from '@/components/ClipboardCopy/ClipboardCopy.vue';
import { ref } from "vue";
import { computed } from "vue";
import relativeTime from "dayjs/plugin/relativeTime";
import { onMounted } from "vue";
import { database } from "@/core/database";
import type { Subscription } from "rxjs";
import { onBeforeUnmount } from "vue";
import { observe } from "@/core/broadcast";
import { useRoute, useRouter } from "vue-router";
import { watch } from "vue";
import { dbToDataType } from "@/core/database/dbToDataType";
import { extractClasses } from "@/core/utils/mapper";
import type { Filters } from "./DataFilters/DataFilters.vue";
import DataFilters from "./DataFilters/DataFilters.vue";
import { VDataTable } from 'vuetify/labs/VDataTable';
import { constructEmail, handleLastPlan } from "./utils";
import { headers } from "./headers";
import ButtonBottomNav from "@/components/ButtonBottomNav.vue";
import { copyToClipboard } from "@/core/utils/utils";
dayjs.extend(relativeTime);

interface SortIem {
  key: string;
  order: 'asc' | 'desc';
}

const membershipFilter = ref<"active" | "expired" | null>('expired');
const classesFilter = ref<string[]>([]);
const textFilter = ref<string>('');
const persons = ref<DataType[]>([]);
const userView = ref<boolean>(false);
const loading = ref<boolean>(false);

const route = useRoute();
const router = useRouter();

let subs: Subscription[] = [];
onBeforeUnmount(() => {
  subs.forEach((s) => s.unsubscribe());
});

onMounted(async () => {
  router.replace({
    query: {
      membership: "expired",
    },
  })
  userView.value = route.params.id !== undefined;
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

watch(
  () => route.params.id,
  () => {
    userView.value = route.params.id !== undefined;
  },
);

watch(
  () => route.query,
  () => {
    const classes = route.query.classes as string[];
    if (typeof classes === "string") {
      classesFilter.value = [classes];
    } else if (Array.isArray(classes)) {
      classesFilter.value = classes;
    } else {
      classesFilter.value = [];
    }
    const membership = route.query.membership;
    membershipFilter.value = !membership ? null : membership as "active" | "expired";
  },
  { immediate: true}
)

async function init() {
  loading.value = true;
  const personsList = await database.persons.toArray();
  const membershipsList = await database.memberships.toArray();
  const personMembershipsList = await database.personMemberships.toArray();

  persons.value = dbToDataType(personsList, membershipsList, personMembershipsList);
  loading.value = false;
}

const members = computed(() => {
  const memberList = persons.value
    .filter((item) => {
      let membership = false;
      if (membershipFilter.value === null) {
        membership = true;
      } else if (membershipFilter.value === "active") {
        membership = ['active', 'active - expires'].includes(item.toExpiration?.status ?? '')
          || dayjs(item.toExpiration?.date).isAfter(dayjs());
      } else {
        membership =
          !item.toExpiration || dayjs(item.toExpiration?.date).isBefore(dayjs());
      }
      let classes = false;
      if (classesFilter.value.length === 0) {
        classes = true;
      } else {
        classes = item.plans.some((c) =>
          classesFilter.value.includes(c.className),
        );
      }
      return classes && membership;
    })
  return memberList;
});

const classes = computed(() => {
  return extractClasses(persons.value);
});

function filter(filter: Partial<Filters>) {
  if (filter.membership !== undefined) {
    membershipFilter.value = filter.membership;
  }
  if (filter.selectedClasses !== undefined) {
    classesFilter.value = filter.selectedClasses;
  }
  if (filter.text !== undefined) {
    textFilter.value = filter.text;
  }
  router.push({
    query: {
      membership: membershipFilter.value,
      classes: classesFilter.value,
    },
  });
}

function userLink(item: DataType) {
  return router.resolve({
    path: `/${item._index}`,
    query: {
      membership: membershipFilter.value,
      classes: classesFilter.value,
    },
  }).href;
}

function updateRoute(event: boolean) {
  if (!event) {
    router.push({
      path: '/',
      query: {
        membership: membershipFilter.value,
        classes: classesFilter.value,
      },
      params: {}
    });
  }
}

const sortBy = ref<SortIem[]>([{ key: 'calories', order: 'asc' }]);
function updateSortBy(event: SortIem[]) {
  const expirationDateSort = event.find((e) => e.key === 'toExpiration.date');
  if (expirationDateSort) {
    sortBy.value = event.concat([{ key: 'toExpiration.status', order: 'desc' }]);
    return;
  }
  sortBy.value = event;
}

const selected = ref<number[]>([]);
function copySelectionAttrToClipboard(attr: Array<keyof DataType>) {
  const value = selected.value
    .map((itemIndex) => members.value.find((member) => member._index === itemIndex) as DataType)
    .map((item) => attr.map((a) => item[a]).join(' '))
    .join('\n');
  copyToClipboard(value);
}
</script>

<template>
  <DataFilters @filter="filter" :filters="{
    membership: membershipFilter,
    selectedClasses: classesFilter,
    text: textFilter,
  }" :classes="classes" :count="members.length" :total="persons.length" />
  <template v-if="loading">
    <v-progress-linear indeterminate color="primary" :height="12"></v-progress-linear>
  </template>
  <v-data-table
    v-model="selected"
    v-model:sort-by="sortBy"
    show-select
    item-value="_index"
    items-per-page="25"
    :headers="headers"
    :items="members"
    :search="textFilter"
    @update:sort-by="updateSortBy">
    <template #[`item.name`]="{ item }">
      {{ item.raw.lastName }} {{ item.raw.firstName }}
    </template>
    <template #[`item.creationDate`]="{ item }">
      {{ dayjs(item.raw.creationDate).fromNow() }}
      <v-tooltip activator="parent">
      {{ dayjs(item.raw.creationDate).format('MM-DD-YYYY') }}
      </v-tooltip>
    </template>
    <template #[`item.email`]="{ item }">
      {{  item.raw.email }}
      <span class="float-right">
        <v-btn
          class="mr-2"
          aria-label="Send email"
          title="Send email"
          size="small"
          variant="plain"
          density="compact"
          icon="mdi-email"
          :href="constructEmail(item.raw.email.toString())" />
        <clipboard-copy
          alt="Copy email"
          size="small"
          :copy="item.raw.email.toString()" />
      </span>
    </template>
    <template #[`item.toExpiration.date`]="{ item }">
      <b :class="handleLastPlan(item.raw.toExpiration).cssClass">
        {{ handleLastPlan(item.raw.toExpiration).label }}
        <template v-if="item.raw.toExpiration">
          {{ item.raw.toExpiration.status.includes('cancels') ? '*' : '' }}
          <v-tooltip v-if="item.raw.toExpiration.status.includes('cancels')"
            activator="parent">
            Is planned to be canceled on {{ dayjs(item.raw.toExpiration.date).format('MM-DD-YYYY') }}
          </v-tooltip>
        </template>
      </b>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-btn variant="plain" :to="userLink(item.raw)">
        More
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>
  </v-data-table>
  <v-bottom-navigation v-if="selected.length > 0">
    <button-bottom-nav
      :label="selected.length > 1 ? 'Copy names' : 'Copy name'"
      :icon="selected.length > 1 ? 'mdi-account-multiple' : 'mdi-account'"
      :title="selected.length > 1 ? 'Copy names' : 'Copy name'"
      @click="copySelectionAttrToClipboard(['firstName', 'lastName'])" />
    <button-bottom-nav
      :label="selected.length > 1 ? 'Copy emails' : 'Copy email'"
      :icon="selected.length > 1 ? 'mdi-email-multiple' : 'mdi-email'"
      :title="selected.length > 1 ? 'Copy emails' : 'Copy email'"
      @click="copySelectionAttrToClipboard(['email'])" />
    <button-bottom-nav
      :label="selected.length > 1 ? 'Copy addresses' : 'Copy address'"
      :icon="selected.length > 1 ? 'mdi-map-marker-multiple' : 'mdi-map-marker'"
      :title="selected.length > 1 ? 'Copy addresses' : 'Copy address'"
      @click="copySelectionAttrToClipboard(['address'])" />
    <button-bottom-nav
      :label="selected.length > 1 ? 'Copy dancers name' : 'Copy dancer name'"
      :icon="selected.length > 1 ? 'mdi-account-multiple' : 'mdi-account'"
      :title="selected.length > 1 ? 'Copy dancers name' : 'Copy dancer name'"
      @click="copySelectionAttrToClipboard(['dancerName'])" />
  </v-bottom-navigation>
  <v-dialog 
      @update:model-value="updateRoute($event)" 
      v-model="userView"
      width="auto"
      min-width="650px">
    <RouterView />
  </v-dialog>
</template>

<style scoped>
th {
  cursor: pointer;
}

tbody tr {
  border-bottom: 1px solid #e0e0e0;
}

.mainTable tbody tr:nth-child(even) {
  background-color: #f5f5f5;
}

.plansTable table tbody tr:last-child td {
  border-bottom: 1px solid #e0e0e0;
}

.mainTable .plansTable tr td,
.mainTable .plansTable tr th {
  border-right: 1px solid #e0e0e0;
}

.plansTable tr td:first-child,
.plansTable tr th:first-child {
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

.mainTable .plansTable tr.planExpired {
  background-color: #ffebee;
}

.mainTable .plansTable tr.planOngoing {
  background-color: #e8f5e9;
}

.mainTable .plansTable tr.planUnknown {
  background-color: rgba(0, 0, 0, 0.04);
}

.date-passed {
  color: red;
}

.date-canceled {
  color: orange;
}

.date-future {
  color: green;
}
</style>
