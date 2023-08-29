<script setup lang="ts">
import { database, type Membership, type Person, type PersonsMemberships } from '@/core/database';
import { elapsed } from '@/core/utils/utils';
import dayjs from 'dayjs';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ClipboardCopy from '../ClipboardCopy/ClipboardCopy.vue';

type MembershipData = PersonsMemberships & {
  membership: Membership;
  isActive: boolean;
  isValid: boolean;
}

const route = useRoute();
const member = ref<Person>();
const memberships = ref<MembershipData[]>();
const loading = ref<boolean>(true);

onMounted(async () => {
  loading.value = true;
  const personId = parseInt(route.params.id as string);
  member.value = await database.persons.get(personId);
  const personMemberships = await database.personMemberships.where('personId').equals(personId).toArray();
  memberships.value = await Promise.all(personMemberships
    .map<Promise<MembershipData>>(async (pm) => {
      const membership = await database.memberships.get(pm.membershipId);
      return {
        ...pm,
        isActive: dayjs(pm.endDate).isValid() ? dayjs(pm.endDate).isAfter(dayjs()) : false,
        isValid: dayjs(pm.endDate).isValid(),
        membership: membership as Membership,
      }
    }));
  memberships.value.sort((a, b) => {
    if (!dayjs(a.endDate).isValid()) {
      return 1;
    }
    if (!dayjs(b.endDate).isValid()) {
      return -1;
    }
    return dayjs(b.endDate).diff(dayjs(a.endDate))
  });
  loading.value = false;
});
</script>
<template>
  <v-card v-if="member && memberships">
    <v-card-title>
      Member: {{ member.firstname }} {{ member.lastname }}
      <v-icon>{{ member.status === 'approved' ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}</v-icon>
      <clipboard-copy :copy="`${member.firstname} ${member.lastname}`" />
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="4">Email:</v-col>
          <v-col cols="8">
            <a :href="`mailto:${member.email}`">{{ member.email }}</a>
            <v-icon class="ml-2">{{ member.mailingList ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}</v-icon>
            <clipboard-copy :copy="member.email" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">Created on:</v-col>
          <v-col cols="8">
            {{ dayjs(member.creationDate).format('MM-DD-YYYY HH:mm') }} -
            <b>{{ dayjs(member.creationDate).fromNow() }}</b>
            <clipboard-copy :copy="dayjs(member.creationDate).format('MM-DD-YYYY HH:mm')" />
          </v-col>
        </v-row>
        <v-row>
          <v-col col="4">Dancer name:</v-col>
          <v-col cols="8">
            {{ member.dancerName }}
            <clipboard-copy :copy="member.dancerName" />
          </v-col>
        </v-row>
        <v-row>
          <v-col col="4">Adresse:</v-col>
          <v-col cols="8">
            {{ member.address }}
            <clipboard-copy :copy="member.address" />
          </v-col>
        </v-row>
        <v-row>
          <v-col col="4">Timezone:</v-col>
          <v-col cols="8">
            {{ member.timezone }}
            <clipboard-copy :copy="member.timezone" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="8">
            With
            <v-chip>{{ memberships.filter(m => dayjs(m.endDate).isAfter(dayjs())).length }}</v-chip>
            active membership(s)
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-title v-if="memberships.length > 0">
      Memberships
    </v-card-title>
    <v-card-text v-if="memberships.length > 0">
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>End date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="membership in memberships" :key="membership.membershipId" :class="membership.isActive ? 'active' : ''">
            <td>{{ membership.membership.name }}</td>
            <td>{{ membership.isValid ? dayjs(membership.endDate).format('YYYY-MM-DD') : '' }}</td>
            <td>{{ membership.isValid ? elapsed(membership.endDate).label : '' }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<style scoped>
.active {
  background-color: #e8fdcf;
}
</style>