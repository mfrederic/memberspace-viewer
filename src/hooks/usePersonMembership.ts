import { type Ref, ref, watchEffect } from "vue";
import { database, type PersonsMemberships, type Person } from "@/core/database";

export type PersonWithMembership = Person & { personMembership: PersonsMemberships };

export function usePersonMemberships() {
  const personMemberships = ref<PersonsMemberships[]>([]);
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    personMemberships.value = await database.personMemberships.toArray();
    loading.value = false;
  });

  return {
    personMemberships,
    loading,
  };
}

export function usePersonMembershipsByMembership(membershipId: Ref<number>) {
  const membersWithMembership = ref<PersonWithMembership[]>([]);
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    const personMembershipsData = await database.personMemberships.where('membershipId').equals(membershipId.value).toArray();
    const personIds = personMembershipsData.map(pm => pm.personId);
    const persons = await database.persons.where('id').anyOf(personIds).toArray();
    membersWithMembership.value = persons
      .map((person) => ({
        ...person,
        personMembership: personMembershipsData.find(pm => pm.personId === person.id) as PersonsMemberships,
      }))
      .sort((a, b) => {
        const aStatus = ['active', 'willCancelOn'].includes(a.personMembership.status) ? 0 : 1;
        const bStatus = ['active', 'willCancelOn'].includes(b.personMembership.status) ? 0 : 1;
        return aStatus - bStatus;
      });
    loading.value = false;
  });

  return {
    membersWithMembership,
    loading,
  };
}