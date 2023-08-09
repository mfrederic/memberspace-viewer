<script setup lang="ts">
import { copyToClipboard } from '@/core/utils/utils';

const props = defineProps<{
  copy: string;
  left?: boolean;
}>();
</script>
<template>
  <v-btn :class="left ? '' : 'float-right'" variant="plain" density="compact" icon="mdi-content-copy" @click="copyToClipboard(props.copy)" />
</template>