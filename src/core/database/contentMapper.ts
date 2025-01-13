import type { Member } from "@/components/ImportFile/membership.interface";
import type { Membership, Person, PersonsMemberships } from "@/core/database";

export interface MappedForDB {
  personList: Person[];
  personMembershipList: PersonsMemberships[];
  membershipsList: Membership[];
}

type MembershipMap = Map<string, { count: number; id: number }>;

function mapMembership(mapped: Member[]): MembershipMap {
  let id = 1;
  return mapped.reduce((accu, item) => {
    if (item.plans.length > 0) {
      item.plans.forEach((plan) => {
        const membership = accu.get(plan.className);
        if (!membership) {
          accu.set(plan.className, { count: 1, id: id });
          id++;
        } else {
          accu.set(plan.className, {
            count: membership.count + 1,
            id: membership.id,
          });
        }
      });
    }
    return accu;
  }, new Map<string, { count: number; id: number }>())
}

function mapMembershipList(memberships: MembershipMap): Membership[] {
  return Array.from(memberships.entries())
    .map<Membership>(
      ([key, value]) => {
        const active = key.toLowerCase().indexOf('old') === -1;
        return {
          id: value.id,
          active,
          name: key,
        }
      },
    )
}

export function mapDataTypeToDB(mapped: Member[]): MappedForDB {
  const memberships = mapMembership(mapped);
  const membershipsList = mapMembershipList(memberships);

  const mappedData = mapped.reduce(
    (accu, item, index) => {
      const person = {
        id: index,
        firstname: item.firstName,
        lastname: item.lastName,
        email: item.email,
        status: item.status,
        timezone: item.timezone,
        mailingList: item.mailingList,
        address: item.address,
        dancerName: item.dancerName,
        creationDate: item.creationAt,
      };
      accu.personList.push(person);

      if (item.plans.length <= 0) {
        return accu;
      }

      item.plans.forEach((plan) => {
        const membership = memberships.get(plan.className);
        if (membership) {
          accu.personMembershipList.push({
            personId: person.id,
            membershipId: membership.id,
            status: plan.status,
            endDate: plan.date,
          });
        }
      });
      return accu;
    },
    {
      personList: [] as Person[],
      personMembershipList: [] as PersonsMemberships[],
    },
  );

  return {
    personList: mappedData.personList,
    personMembershipList: mappedData.personMembershipList,
    membershipsList,
  };
}
