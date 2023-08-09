import type { Membership, Person, PersonsMemberships } from "@/core/database";
import type { DataType } from "@/core/interfaces/dataTypes";

export interface MappedForDB {
  personList: Person[];
  personMembershipList: PersonsMemberships[];
  membershipsList: Membership[];
}

export function mapDataTypeToDB(mapped: DataType[]): MappedForDB {
  let id = 1;
  const memberships = mapped.reduce((accu, item) => {
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
  }, new Map<string, { count: number; id: number }>());

  const membershipsList = Array.from(memberships.entries())
    .map<Membership>(
      ([key, value]) => {
        const active = key.toLowerCase().indexOf('old') === -1;
        return {
          id: value.id,
          active,
          name: key,
        }
      },
    );

  id = 1;
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
      };
      accu.personList.push(person);
      if (item.plans.length > 0) {
        item.plans.forEach((plan) => {
          const membership = memberships.get(plan.className);
          if (membership) {
            accu.personMembershipList.push({
              personId: person.id,
              membershipId: membership.id,
              status: plan.status,
              endDate: plan.date,
            });
            id++;
          }
        });
      }
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
