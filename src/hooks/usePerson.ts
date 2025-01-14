import { ref, watchEffect, type Ref } from "vue";
import dayjs from "@/utils/date";
import type { Person } from "@/core/database/persons";
import { database, type Membership, type PersonsMemberships } from "@/core/database";

export type MembershipData = PersonsMemberships & {
  membership: Membership;
  isActive: boolean;
  isValid: boolean;
}

export function usePerson(personId: Ref<number>) {
  const member = ref<Person | null>(null);
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    try {
      member.value = await database.persons.get(personId.value) ?? null;
    } finally {
      loading.value = false;
    }
  });

  return {
    member,
    loading,
  };
}

export function usePersons(personIds?: Ref<number[]>) {
  const persons = ref<Person[]>([]);
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    if (personIds) {
      persons.value = await database.persons.where('id').anyOf(personIds.value).toArray();
    } else {
      persons.value = await database.persons.toArray();
    }
    loading.value = false;
  });

  return {
    persons,
    loading,
  };
}

export function usePersonMembershipsByPerson(personId: Ref<number>) {
  const memberships = ref<MembershipData[]>([]);
  const loading = ref<boolean>(false);

  watchEffect(async () => {
    loading.value = true;
    try {
      const personMemberships = await database.personMemberships
        .where('personId')
        .equals(personId.value)
        .toArray();
  
      const unsortedMemberships = await Promise.all(
        personMemberships.map<Promise<MembershipData>>(async (pm) => {
          const membership = await database.memberships.get(pm.membershipId);
          return {
            ...pm,
            isActive: pm.endDate && dayjs(pm.endDate).isValid()
              ? dayjs(pm.endDate).isAfter(dayjs())
              : pm.status === 'active',
            isValid: pm.endDate ? dayjs(pm.endDate).isValid() : pm.status === 'active',
            membership: membership as Membership,
          };
        })
      );
  
      memberships.value = unsortedMemberships.sort((a, b) => {
        if (!a.isActive) return 1;
        if (!b.isActive) return -1;
        if (!dayjs(a.endDate).isValid()) return 1;
        if (!dayjs(b.endDate).isValid()) return -1;
        return dayjs(b.endDate).diff(dayjs(a.endDate));
      });
    } finally {
      loading.value = false;
    }
  });

  return {
    memberships,
    loading,
  };
}
