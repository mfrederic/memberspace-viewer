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
}

const emits = defineEmits<{
  (event: "filter", filters: Partial<Filters>): void;
  (event: "filter:membership", type: "active" | "expired" | null): void;

}>();

const membershipValue = ref<number | null>(props.filters.membership === "active" ? 0 : props.filters.membership === "expired" ? 1 : null);
function membershipFiltering(value: number) {
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
          <v-card>
            <v-card-text>
              <h2>{{ count }} / {{ total }}</h2>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col md="2">
          <v-btn-toggle
            v-model="membershipValue"
            divided
            color="primary"
            @update:model-value="membershipFiltering"
          >
            <v-btn>Active</v-btn>
            <v-btn>Expired</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col md="4">
          <p>Classes</p>
          <v-select
            v-model="classesValue"
            density="compact"
            label="Classes"
            :items="classes"
            multiple
            chips
            @update:model-value="classesFiltering($event)"
          ></v-select>
        </v-col>
        <v-col md="4">
          <v-text-field
            density="compact"
            label="Text search"
            append-icon="mdi-magnify"
            single-line
            hide-details
            @update:model-value="textFiltering" />
        </v-col>
        <v-col>
          <v-btn @click="resetFilters()">Reset</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
