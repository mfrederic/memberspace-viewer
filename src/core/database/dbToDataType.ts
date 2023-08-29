import dayjs from "dayjs";
import type { Membership, Person, PersonsMemberships } from "../database";
import type { ClassItem, DataType } from "../interfaces/dataTypes";

export function dbToDataType(
  personsList: Person[],
  membershipsList: Membership[],
  personMembershipsList: PersonsMemberships[],
): DataType[] {
  return personsList.map<DataType>((person) => {
    let lastPlan: ClassItem | undefined;
    const memberships = personMembershipsList
      .filter((personMembership) => personMembership.personId === person.id)
      .map<ClassItem | null>((personMembership) => {
        const membership = membershipsList.find(
          (membership) => membership.id === personMembership.membershipId,
        );
        if (membership) {
          if (!lastPlan || dayjs(lastPlan.date).isBefore(personMembership.endDate)) {
            console.log('lastPlan', lastPlan, personMembership)
            lastPlan = {
              className: membership.name.toLowerCase(),
              status: membership.active ? personMembership.status : 'canceled',
              date: personMembership.endDate,
            };
          }
          return {
            className: membership.name,
            status: membership.active ? "Active" : "Inactive",
            date: personMembership.endDate,
          };
        }
        return null;
      })
      .filter((membership) => membership !== null) as ClassItem[];
    memberships.sort((a, b) => (dayjs(a.date).isBefore(b.date) ? 1 : -1));
    return {
      _index: person.id,
      status: person.status,
      firstName: person.firstname,
      lastName: person.lastname,
      email: person.email,
      timezone: person.timezone,
      mailingList: person.mailingList,
      address: person.address,
      dancerName: person.dancerName,
      plans: memberships,
      toExpiration: lastPlan,
      creationDate: person.creationDate,
    };
  });
}
