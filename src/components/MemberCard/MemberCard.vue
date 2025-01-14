<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { elapsed } from "@/core/utils/utils";
import dayjs from "@/utils/date";
import ClipboardCopy from "@/components/ClipboardCopy/ClipboardCopy.vue";
import { usePerson, usePersonMembershipsByPerson } from "@/hooks/usePerson";

const route = useRoute();
const personId = computed(() => parseInt(route.params.id as string));

const { member, loading: memberLoading } = usePerson(personId);
const { memberships, loading: membershipsLoading } = usePersonMembershipsByPerson(personId);
</script>
<template>
  <v-card :loading="memberLoading || membershipsLoading">
    <v-card-title v-if="member">
      Member: {{ member.firstname }} {{ member.lastname }}
      <v-icon>{{ member.status === 'approved' ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}</v-icon>
      <clipboard-copy :copy="`${member.firstname} ${member.lastname}`" />
    </v-card-title>
    <v-card-text v-if="member">
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
        <v-row v-if="memberships">
          <v-col cols="8">
            With
            <v-chip>{{ memberships.filter(m => dayjs(m.endDate).isAfter(dayjs())).length }}</v-chip>
            active membership(s)
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-title v-if="memberships && memberships.length > 0">
      Memberships
    </v-card-title>
    <v-card-text v-if="memberships && memberships.length > 0">
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>End date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="membership in memberships"
            :key="membership.membershipId"
            :class="{
              'bg-orange-lighten-4': !membership.isActive,
              'bg-green-lighten-4': membership.isActive,
            }"
          >
            <td>{{ membership.membership.name }}</td>
            <template v-if="membership.isValid">
              <td>{{ membership.status !== 'active' ? dayjs(membership.endDate).format('YYYY-MM-DD') : 'recurring' }}</td>
              <td :class="elapsed(membership.endDate).cssClass">{{ elapsed(membership.endDate).label }}</td>
            </template>
            <template v-else>
              <td></td>
              <td></td>
            </template>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>