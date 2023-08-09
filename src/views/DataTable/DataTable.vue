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
import { constructEmail } from "./utils";
import { headers } from "./headers";
dayjs.extend(relativeTime);

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
  setSorting("toExpiration", "desc");
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
  const sortKey = sorting.value.key as keyof DataType;
  const sortOrder = sorting.value.order;
  memberList
    .sort((a, b) => {
      if (sortOrder === "natural") {
        return a._index - b._index;
      }
      function getSortingValue(plan?: ClassItem) {
        if (!plan) {
          return undefined;
        }
        if (plan.status === 'active' || plan.status === 'expired') {
          return plan.date;
        } else if (plan.status === 'canceled') {
          return dayjs(plan.date).add(-99, 'year').toDate();  
        }
        return undefined;
      }
      const aValue = sortKey !== 'toExpiration'
        ? a[sortKey]
        : getSortingValue(a.toExpiration);
      const bValue = sortKey !== 'toExpiration'
        ? b[sortKey]
        : getSortingValue(b.toExpiration);
      if (!aValue) {
        return 1;
      }
      if (!bValue) {
        return -1;
      }
      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  return memberList;
});

const classes = computed(() => {
  return extractClasses(persons.value);
});

const sorting = ref({
  key: "email",
  order: "natural",
});
function sortOrderIcon(key: keyof DataType) {
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

function setSorting(key: keyof DataType, dir?: "asc" | "desc" | "natural") {
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
}

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

function handleLastPlan(lastPlan?: ClassItem) {
  if (!lastPlan) {
    return {
      label: '',
      cssClass: '',
    }
  }
  if (lastPlan.status === 'canceled') {
    return {
      label: 'canceled',
      cssClass: '',
    }
  } else if (lastPlan.status === 'expired') {
    return {
      label: dayjs(lastPlan.date).fromNow(),
      cssClass: 'date-passed'
    }
  } else if(lastPlan.status === 'active - expires') {
    return {
      label: dayjs().to(lastPlan.date),
      cssClass: 'date-future'
    }
  } else if (lastPlan.status === 'active') {
    return {
      label: 'recurring',
      cssClass: 'date-future',
    }
  } else {
    return {
      label: '',
      cssClass: '',
    }
  }
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
    items-per-page="25"
    :headers="headers"
    :items="members"
    :search="textFilter">
    <template #[`item.name`]="{ item }">
      {{ item.raw.lastName }} {{ item.raw.firstName }}
    </template>
    <template #[`item.email`]="{ item }">
      <v-btn size="small" variant="plain" density="compact"
            :href="constructEmail(item.raw.email.toString())">{{ item.raw.email }}</v-btn>
    </template>
    <template #[`item.toExpiration.date`]="{ item }">
      <b :class="handleLastPlan(item.raw.toExpiration).cssClass">{{ handleLastPlan(item.raw.toExpiration).label }}</b>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-btn variant="plain" :to="userLink(item.raw)">
        More
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>
  </v-data-table>
  <v-dialog 
      @update:model-value="updateRoute($event)" 
      v-model="userView"
      width="auto"
      min-width="450px">
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

.date-future {
  color: green;
}
</style>
