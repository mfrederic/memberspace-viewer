<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  classes: string[];
  count: number;
  total: number;
  filters: Partial<Filters>;
}>();

export interface Filters {
  membership: "active" | "expired" | null;
  selectedClasses: string[];
  text: string;
  hideNoMembership: boolean;
}

const emits = defineEmits<{
  (event: "filter", filters: Partial<Filters>): void;
  (event: "filter:membership", type: "active" | "expired" | null): void;
  (event: "filter:hideNoMembership", value: boolean): void;
}>();

const membershipValue = ref<number | null>(props.filters.membership === "active" ? 0 : props.filters.membership === "expired" ? 1 : null);
function membershipFiltering(value: number | null) {
  let filter: "active" | "expired" | null = null;
  switch (value) {
    case 0:
      filter = "active";
      break;
    case 1:
      filter = "expired";
      break;
  }
  emits("filter:membership", filter);
  emits("filter", { membership: filter });
}

const classesValue = ref<string[]>(props.filters.selectedClasses ?? []);
function classesFiltering(value: string[]) {
  emits("filter", { selectedClasses: value });
}

const textValue = ref<string>('');
function textFiltering(value: string) {
  emits("filter", { text: value });
}

const hideNoMembership = ref<boolean>(props.filters.hideNoMembership ?? false);
function hideNoMembershipFiltering(value: boolean | null) {
  emits("filter:hideNoMembership", value ?? false);
  emits("filter", { hideNoMembership: value ?? false });
}

function resetFilters() {
  emits("filter", { membership: null, selectedClasses: [] });
  membershipValue.value = null;
  classesValue.value = [];
  textValue.value = '';
}
</script>

<template>
  <v-card>
    <v-card-text>
      <v-row align="center">
        <v-col md="1">
          <h2>{{ count }} / {{ total }}</h2>
        </v-col>
        <v-col md="3">
          <div class="d-flex flex-column">
              <v-btn-toggle
                v-model="membershipValue"
                divided
                density="compact"
                color="primary"
              @update:model-value="membershipFiltering" 
            >
              <v-btn>Active</v-btn>
              <v-btn>Expired</v-btn>
            </v-btn-toggle>
            <v-switch
              hide-details
              density="compact"
              color="primary"
              v-model="hideNoMembership"
              label="Hide no membership"
              @update:model-value="hideNoMembershipFiltering"
            ></v-switch>
          </div>
        </v-col>
        <v-col>
          <p>Classes/Memberships</p>
          <v-select
            v-model="classesValue"
            density="compact"
            label="Classes/Memberships"
            :items="classes"
            multiple
            chips
            clearable
            @update:model-value="classesFiltering($event)"
          ></v-select>
        </v-col>
        <v-col>
          <v-text-field
            v-model="textValue"
            density="compact"
            append-icon="mdi-magnify"
            label="Search by text..."
            hide-details
            clearable
            @update:model-value="textFiltering" />
        </v-col>
        <v-col>
          <v-btn @click="resetFilters()" append-icon="mdi-refresh">
            Reset
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
