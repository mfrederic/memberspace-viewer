<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import MembershipsTable from './MembershipsTable.vue';

const route = useRoute();

const membershipsView = ref<boolean>(route.params.id !== undefined);

function selectMembership() {
  membershipsView.value = true;
}

</script>
<template>
  <MembershipsTable @selectMembership="selectMembership" />
  <v-dialog
    v-model="membershipsView"
    width="auto"
    min-width="650px">
    <router-view />
  </v-dialog>
</template>
