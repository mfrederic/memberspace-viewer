<script setup lang="ts">
import { copyToClipboard } from '@/core/utils/utils';

const props = defineProps({
  copy: {
    type: String,
    required: true,
  },
  left: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'default',
  },
  alt: {
    type: String,
    default: 'Copy to clipboard',
  },
});
</script>
<template>
  <v-btn :aria-label="alt" :title="alt" :class="left ? '' : 'float-right'" :size="size" variant="plain" density="compact" icon="mdi-content-copy" @click="copyToClipboard(props.copy)" />
</template>