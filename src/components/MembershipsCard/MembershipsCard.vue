<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { database, type Membership, type Person, type PersonsMemberships } from "@/core/database";
import dayjs from "@/utils/date";
import ClipboardCopy from "@/components/ClipboardCopy/ClipboardCopy.vue";
import { RouteName } from "@/core/routes";

const route = useRoute();
const router = useRouter();
const membership = ref<Membership>();
const personMemberships = ref<PersonsMemberships[]>([]);
const members = ref<Person[]>([]);
const loading = ref<boolean>(true);

onMounted(async () => {
  loading.value = true;
  const membershipId = parseInt(route.params.id as string);
  membership.value = await database.memberships.get(membershipId);
  personMemberships.value = await database.personMemberships.where('membershipId').equals(membershipId).toArray();
  members.value = await database.persons.where('id').anyOf(personMemberships.value.map(pm => pm.personId)).toArray();
  loading.value = false;
});

const membershipMembers = computed(() => (members.value ?? []).map((member) => {
  const personMembership = personMemberships.value?.find(pm => pm.personId === member.id);
  return {
    ...member,
    personMembership: personMembership as PersonsMemberships,
  };
}).sort((a, b) => {
  const aStatus = ['active', 'willCancelOn'].includes(a.personMembership.status) ? 0 : 1;
  const bStatus = ['active', 'willCancelOn'].includes(b.personMembership.status) ? 0 : 1;
  return aStatus - bStatus;
}));

const isInactive = computed(() => {
  return membership.value?.name.toLowerCase().includes("old") ||
    members.value.length - multipleCounts.value.activeCount === members.value.length;
});

const multipleCounts = computed(() => {
  return membershipMembers.value.reduce((acc, membershipMember) => {
    if (['active', 'willCancelOn'].includes(membershipMember.personMembership.status)) {
      if (membershipMember.personMembership.status === 'active') {
        acc.recurringCount++;
        acc.activeCount++;
      }
      if (membershipMember.personMembership.endDate && dayjs(membershipMember.personMembership.endDate).isAfter(dayjs())) {
        acc.activeCount++;
      }
      return acc;
    }
    acc.inactiveCount++;
    return acc;
  }, { recurringCount: 0, activeCount: 0, inactiveCount: 0 });
});


function userLink(item: Person) {
  return router.resolve({
    name: RouteName.Member,
    params: {
      id: item.id,
    },
  }).href;
}

</script>
<template>
  <v-card v-if="membership">
    <v-card-title>
      Membership: {{ membership.name }}
      <v-icon>{{ !isInactive ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}</v-icon>
      <clipboard-copy :copy="membership.name" />
    </v-card-title>
    <v-card-text>
      <h4>Recurring: <small>{{ multipleCounts.recurringCount }}</small></h4>
      <h4>Active: <small>{{ multipleCounts.activeCount }}</small></h4>
      <h4>Inactive: <small>{{ multipleCounts.inactiveCount }}</small></h4>
    </v-card-text>
    <template v-if="membershipMembers.length > 0">
      <v-card-title>
        Members
      </v-card-title>
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>End date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="members in membershipMembers"
              :key="members.id"
              :class="{
                'bg-orange-lighten-4': !['active', 'willCancelOn'].includes(members.personMembership.status),
                'bg-green-lighten-4': ['active', 'willCancelOn'].includes(members.personMembership.status),
              }"
            >
              <td>{{ members.firstname }} {{ members.lastname }}</td>
              <td>{{ ['active', 'willCancelOn'].includes(members.personMembership.status) ? 'Active' : 'Inactive' }}</td>
              <td>{{ members.personMembership.endDate ? dayjs(members.personMembership.endDate).format('YYYY-MM-DD') : 'recurring' }}</td>
              <td>
                <v-btn
                  variant="plain"
                  :to="userLink(members)">
                  View
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </template>
  </v-card>
</template>