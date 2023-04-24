import { Dayjs } from "dayjs";
import { Event } from "./event";
import { Ref, computed, ref } from "vue";

export type SchedulerResource = {
  id: number | string,
  name: string,
  image?: string,
  events: Event[]
}

export class Resource {

  id: string | number;
  name: string;
  image?: string | undefined;
  events: Ref<Event[]>;

  constructor({ id, name, image, events = [] }: SchedulerResource) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.events = ref<Event[]>(events);
  }

  get countOverlappingAppointments(): number {
    let count = 1
    this.events.value.sort((a, b) => a.start.diff(b.start)).map((current: Event, index: number) => {
      if (index > 0) {
        const prev = this.events.value[index - 1];
        if (current.start.isBetween(prev.start, prev.end, "minute", "[)")) {
          count++;
        }
      }
    });
    return count;
  }

  get maxY(): number {
    return this.events.value.reduce((prev, current) => {
      return prev.top > current.top ? prev : current;
    }, { top: 0 }).top
  }

  get hasEvents(): boolean {
    return this.events.value.length > 0;
  }
}

