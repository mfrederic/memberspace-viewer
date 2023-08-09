<script setup lang="ts">
import dayjs from "dayjs";
import { ref, watch } from "vue";

const dateRegex =
  /([a-z]{3} [0-9]{2}  [0-9]{4} at [0-9]{2}:[0-9]{2} [APM]{2})/gim;

const emit = defineEmits<{
  (event: 'data:loaded', data: Record<string, string>[]): void;
  (event: 'data:loading'): void;
}>();
const content = ref("");
const snackbar = ref(false);
const file = ref<File[] | undefined>(undefined);

watch(content, (newVal) => {
  emit("data:loaded", formatData(newVal));
});

function formatData(content: string): Record<string, string>[] {
  const corrected = content
    .replace(/("[^"]*")/gim, (match) =>
      match.replace(/[\n,]/gim, " ").replace(/["]*/, ""),
    )
    .replace(dateRegex, (match) =>
      dayjs(match, "MMM DD  YYYY [at] hh:mm A").format("YYYY-MM-DD HH:mm"),
    );
  const rawLines = corrected.split("\n");
  const headers = rawLines.shift()?.split(",") ?? [];
  const lines: string[][] = [];

  let current: string[] = [];
  rawLines.forEach((line) => {
    const values = line.split(",");
    if (current.length !== headers.length) {
      current.push(...values);
    }
    if (current.length >= headers.length) {
      lines.push(current);
      current = [];
    }
  });

  return lines.map((line) => {
    const obj: Record<string, string> = {};
    line.forEach((value, index) => {
      obj[headers[index]] = value.replace('"', "");
    });
    return obj;
  });
}

function readfile() {
  emit('data:loading');
  const input = document.getElementById("file-input");
  if (!input) return;
  const file = (input as any).files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onerror;
  reader.onload = (e) => {
    content.value = e.target?.result as string;
  };
  reader.readAsText(file);
  snackbar.value = true;
  file.value = undefined;
}
</script>

<template>
  <v-file-input
    :model-value="file"
    accept=".csv"
    label="Memberspace CSV file"
    id="file-input"
    variant="solo"
    density="compact"
  />
  <v-btn color="primary" @click="readfile">Read File</v-btn>

  <v-snackbar v-model="snackbar">
    Membership file loaded
    <template v-slot:actions>
      <v-btn color="primary" variant="text" @click="snackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
