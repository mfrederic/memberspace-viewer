import { Subject, filter, tap } from "rxjs";

export interface BroadcastEvent {
  event: string;
  data?: unknown;
}

const subject = new Subject<BroadcastEvent>();

export const observe = (event: string) => {
  return subject.asObservable().pipe(filter((e) => e.event === event));
};

export const clearData = () => {
  subject.next({
    event: "clearData",
  });
};

export const loadData = () => {
  subject.next({
    event: "loadData",
  });
};

export const send = (event: string, data?: any) => {
  subject.next({ event, data });
};
