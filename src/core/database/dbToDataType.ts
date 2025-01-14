import dayjs from "@/utils/date";
import type { Membership, Person, PersonsMemberships } from "@/core/database";
import type { PlanEntity, MemberEntity } from "@/core/interfaces/dataTypes";
import type { MemberStatus, PlanStatus } from "@/components/ImportFile/membership.interface";

function getMembership(
  membershipsList: Membership[],
  personMembershipsList: PersonsMemberships[],
  personId: number,
) {
  let lastPlan: PlanEntity | undefined;
  const memberships = personMembershipsList
    .filter((personMembership) => 
      personMembership.personId === personId
      && membershipsList.find(
        (membership) => membership.id === personMembership.membershipId,
      )
    )
    .map<PlanEntity>((personMembership) => {
      const membership = membershipsList.find(
        (membership) => membership.id === personMembership.membershipId,
      ) as Membership;
      if (
        !lastPlan
        || (dayjs(lastPlan.date).isBefore(personMembership.endDate) && personMembership.status === 'active')
        || (personMembership.status === 'active' && lastPlan.status !== 'active')
      ) {
        lastPlan = {
          className: membership.name.toLowerCase(),
          status: membership.active
            ? personMembership.status as PlanStatus
            : 'canceled',
          date: personMembership.endDate,
        };
      }
      return {
        className: membership.name,
        status: membership.active ? personMembership.status as PlanStatus : 'canceled',
        date: personMembership.endDate,
      } as PlanEntity;
    });
  return {
    memberships,
    lastPlan,
  }
}

export function dbToDataType(
  personsList: Person[],
  membershipsList: Membership[],
  personMembershipsList: PersonsMemberships[],
): MemberEntity[] {
  return personsList.map<MemberEntity>((person) => {
    const {
      memberships,
      lastPlan,
    } = getMembership(membershipsList, personMembershipsList, person.id);
    memberships.sort((a, b) => (dayjs(a.date).isBefore(b.date) ? 1 : -1));

    return {
      _index: person.id,
      status: person.status as MemberStatus,
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
