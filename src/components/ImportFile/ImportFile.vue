<script setup lang="ts">
import { ref } from "vue";
import type { Member } from "./membership.interface";
import { parseCsv } from "./parser";

const dateRegex =
  /([a-z]{3} [0-9]{2}  [0-9]{4} at [0-9]{2}:[0-9]{2} [APM]{2})/gim;

const emit = defineEmits<{
  (event: 'data:loaded', data: Member[]): void;
  (event: 'data:loading'): void;
}>();
const content = ref("");
const snackbar = ref(false);
const file = ref<File[] | undefined>(undefined);

function formatData(content: string): Member[] {
  return parseCsv(content);
}

function readfile() {
  emit('data:loading');

  const input = document.getElementById("file-input") as HTMLInputElement;
  if (!input) {
    console.error('File input element not found');
    return;
  }

  const selectedFile = input.files?.[0];
  if (!selectedFile) {
    console.error('No file selected');
    return;
  }

  const reader = new FileReader();
  
  reader.onerror = (error) => {
    console.error('Error reading file:', error);
    snackbar.value = false;
  };

  reader.onload = (e) => {
    try {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        throw new Error('Invalid file content');
      }
      content.value = result;
      snackbar.value = true;
      emit("data:loaded", parseCsv(result));
    } catch (err) {
      console.error('Error processing file:', err);
      snackbar.value = false;
    }
  };

  try {
    reader.readAsText(selectedFile);
    file.value = undefined;
  } catch (err) {
    console.error('Error starting file read:', err);
    snackbar.value = false;
  }
}

function handleFileChange(files: File[] | undefined) {
  file.value = files;
  if (!files?.length) {
    content.value = "";
  }
}
</script>

<template>
  <v-file-input
    :model-value="file"
    accept=".csv,text/csv"
    label="Memberspace CSV file"
    id="file-input"
    variant="solo"
    density="compact"
    @change="handleFileChange"
  />
  <v-btn color="primary" @click="readfile" :disabled="!file">Read File</v-btn>

  <v-snackbar v-model="snackbar">
    Membership file loaded
    <template v-slot:actions>
      <v-btn color="primary" variant="text" @click="snackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
