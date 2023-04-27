import { Dayjs } from "dayjs";
import { App, Component } from "vue";

export interface SchedulerResource {
  id: number | string;
  image?: string;
  name: string;
  events: SchedulerEvent[];
}

export interface SchedulerDate {
  from: Dayjs;
  to: Dayjs;
}

export interface SchedulerProps {
  dates: SchedulerDate;
  resources?: SchedulerResource[];
  events?: SchedulerEvent[];
  options?: SchedulerOptions;
}

export interface SchedulerEvent {
  id: number | string;
  start: Dayjs;
  end: Dayjs,
  resourceId: string | number,
  title?: String,
  text: String,
  icon?: String
  color?: String,
  x: number,
  y: number,
  width: number,
  height: number,
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
  height: number,
  margin: number,
  [key: string]: any
}
