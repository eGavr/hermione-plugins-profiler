import { maxBy, minBy, sumBy } from "lodash";

const WAITABLE_EVENTS = ["startRunner", "endRunner", "init"];

export const isEventWaitable = (event: string) =>
  WAITABLE_EVENTS.includes(event);

export const calcDuration = (
  waitable: boolean,
  items: { end: number; start: number }[]
) => {
  if (waitable) {
    const end = maxBy(items, "end")?.end || 0;
    const start = minBy(items, "start")?.start || 0;

    return end - start;
  }

  return sumBy(items, "duration");
};
