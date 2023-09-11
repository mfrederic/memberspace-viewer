<template>
  <v-btn
    :prepend-icon="icon"
    fixed
    bottom
    right
    fab
    dark
    :color="color"
    :title="title"
    @click="$emit('click')">
    {{ label }}
  </v-btn>
</template>
<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
  title: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});
defineEmits<{
  (event: 'click'): void;
}>();
</script>