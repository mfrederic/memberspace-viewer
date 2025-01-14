import { type Ref, ref, watchEffect } from "vue";
import { database, type Membership, type Person, type PersonsMemberships } from "@/core/database";

export function useMembership(membershipId: Ref<number>) {
  const membership = ref<Membership>();
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    membership.value = await database.memberships.get(membershipId.value);
    loading.value = false;
  });

  return {
    membership,
    loading,
  };
}

export function useMemberships(membershipIds?: Ref<number[]>) {
  const memberships = ref<Membership[]>([]);
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    if (membershipIds) {
      memberships.value = await database.memberships.where('id').anyOf(membershipIds.value).toArray();
    } else {
      memberships.value = await database.memberships.toArray();
    }
    loading.value = false;
  });

  return {
    memberships,
    loading,
  };
}

export function useMembershipsMembers(membershipId: Ref<number>) {
  const members = ref<(PersonsMemberships & Person)[]>([]);
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    const personMemberships = await database.personMemberships.where('membershipId').equals(membershipId.value).toArray();

    loading.value = false;
  });

  return {
    members,
    loading,
  };
}