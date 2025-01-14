<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "@/utils/date";
import ClipboardCopy from "@/components/ClipboardCopy/ClipboardCopy.vue";
import { RouteName } from "@/core/routes";
import { useMembership } from "@/hooks/useMembership";
import { usePersonMembershipsByMembership, type PersonWithMembership } from "@/hooks/usePersonMembership";

const route = useRoute();
const router = useRouter();

const membershipId = computed(() => parseInt(route.params.id as string));
const { membership, loading: membershipLoading } = useMembership(membershipId);
const { membersWithMembership, loading: membersWithMembershipLoading } = usePersonMembershipsByMembership(membershipId);

const isInactive = computed(() => {
  return membership.value?.name.toLowerCase().includes("old") ||
  membersWithMembership.value.length - multipleCounts.value.activeCount === membersWithMembership.value.length;
});

const multipleCounts = computed(() => {
  return membersWithMembership.value.reduce((acc, membershipMember) => {
    const status = membershipMember.personMembership?.status ?? 'unknown';
    const endDate = membershipMember.personMembership?.endDate ?? null;
    if (['active', 'willCancelOn'].includes(status)) {
      if (status === 'active') {
        acc.recurringCount++;
        acc.activeCount++;
      }
      if (endDate && dayjs(endDate).isAfter(dayjs())) {
        acc.activeCount++;
      }
      return acc;
    }
    acc.inactiveCount++;
    return acc;
  }, { recurringCount: 0, activeCount: 0, inactiveCount: 0 });
});


function userLink(item: PersonWithMembership) {
  return router.resolve({
    name: RouteName.Member,
    params: {
      id: item.id,
    },
  }).href;
}

</script>
<template>
  <v-card :loading="membershipLoading || membersWithMembershipLoading">
    <v-card-title v-if="membership">
      Membership: {{ membership.name }}
      <v-icon>{{ !isInactive ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}</v-icon>
      <clipboard-copy :copy="membership.name" />
    </v-card-title>
    <v-card-text>
      <h4>Recurring: <small>{{ multipleCounts.recurringCount }}</small></h4>
      <h4>Active: <small>{{ multipleCounts.activeCount }}</small></h4>
      <h4>Inactive: <small>{{ multipleCounts.inactiveCount }}</small></h4>
    </v-card-text>
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
            v-for="members in membersWithMembership"
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
  </v-card>
</template>
