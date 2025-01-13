import type { Membership, Person, PersonsMemberships } from ".";
import Dexie, { type Table } from "dexie";

export class DatabaseService extends Dexie {
  memberships!: Table<Membership>;
  persons!: Table<Person>;
  personMemberships!: Table<PersonsMemberships>;

  constructor() {
    super("memberspace_db");
    this.version(3).stores({
      memberships: "++id, name, active",
      persons:
        "++id, [firstname+lastname], email, timezone, mailingList, dancerName, creationDate",
      personMemberships: "[personId+membershipId], personId, membershipId",
    });
  }
}

export const database = new DatabaseService();
