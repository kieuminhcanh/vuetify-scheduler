import { Dayjs } from "dayjs";
import { Event } from "./event";
import { Ref, computed, ref } from "vue";
import { SchedulerEvent } from ".";

export type SchedulerResource = {
  id: number | string,
  name: string,
  image?: string,
  events: SchedulerEvent[]
}

export class Resource {

  id: string | number;
  name: string;
  image?: string | undefined;
  events: SchedulerEvent[]

  constructor({ id, name, image, events = [] }: SchedulerResource) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.events = events;
  }

  get countOverlappingAppointments(): number {
    let count = 1
    this.events.sort((a, b) => a.start.diff(b.start)).map((current, index) => {
      if (index > 0) {
        const prev = this.events[index - 1];
        if (current.start.isBetween(prev.start, prev.end, "minute", "[)")) {
          count++;
        }
      }
    });

    return count;
  }
}

