import type { MemberEntity } from "../interfaces/dataTypes";

export function extractClasses(data: MemberEntity[]) {
  const classes = new Set<string>();
  data.forEach((item) => {
    item.plans.forEach((plan) => {
      classes.add(plan.className);
    });
  });
  return Array.from(classes);
}