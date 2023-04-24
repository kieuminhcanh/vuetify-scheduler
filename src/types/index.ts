import { Dayjs } from "dayjs";
import { App, Component } from "vue";

export interface SchedulerResource {
  id: number | string;
  image?: string;
  name: string;
}

export interface SchedulerDate {
  from: Dayjs | string | Date;
  to: Dayjs | string | Date;
}

export interface SchedulerProps {
  dates: SchedulerDate;
  resources?: SchedulerResource[];
  events?: SchedulerEvent[];
  options?: SchedulerOptions;
}

export interface SchedulerEvent {
  start: Dayjs | string | Date | number;
  end: Dayjs | string | Date | number,
  resourceId: string | number,
  title?: String,
  text: String,
  icon?: String
  color?: String,
  startPoint?: number,
  endPoint?: number,
  topPoint?: number,
}

export interface SchedulerResourcesOptions {
  width: number,
}

export interface SchedulerOptions {
  intervals: number,
  rowHeight: number,
  resources: SchedulerResourcesOptions,
  events: SchedulerEventsOptions,
  [key: string]: any
}
export interface SchedulerEventsOptions {
  width: number,
  [key: string]: any
}
