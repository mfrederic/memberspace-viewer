<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import ImportFile from "./components/ImportFile/ImportFile.vue";
import { database } from "./core/database/database";
import { clearData as clearDataMsg, loadData } from "./core/broadcast";
import { mapDataTypeToDB } from "./core/database/contentMapper";
import type { Member } from "./components/ImportFile/membership.interface";
import type { RouteName } from "./core/routes";

const route = useRoute();

const pageName = computed(() => route.name as RouteName);

const drawer = ref<boolean>(false);
const loading = ref<boolean>(false);

const onDataLoaded = async (data: Member[]) => {
  const mapped = mapDataTypeToDB(data);
  await clearData();

  await database.persons.bulkAdd(mapped.personList);
  await database.memberships.bulkAdd(mapped.membershipsList);
  await database.personMemberships.bulkAdd(mapped.personMembershipList);

  setTimeout(() => {
    loadData();
    loading.value = false;
  }, 1000);
};

function clearData() {
  database.persons.clear();
  database.memberships.clear();
  database.personMemberships.clear();
  console.log("Data cleared")
  clearDataMsg();
}
</script>

<template>
  <v-layout>
    <v-overlay v-model="loading" />
    <v-app-bar>
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-app-bar-title>{{ pageName }}</v-app-bar-title>
      <template v-slot:append>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
          </template>
          <v-card min-width="400">
            <v-card-text>
              <ImportFile @data:loading="loading = true" @data:loaded="onDataLoaded" />
              <v-btn class="ml-2" @click="clearData()">Clear data</v-btn>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary :scrim="false">
      <v-list nav>
        <v-list-item
          prepend-icon="mdi-home"
          title="Members"
          to="/"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Memberships"
          to="/memberships"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main style="max-width: 100vw; overflow-x: auto">
      <router-view></router-view>
    </v-main>
  </v-layout>
</template>