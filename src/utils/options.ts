import { SchedulerOptions } from "../types";

export const defaultOptions: SchedulerOptions = {
  rowHeight: 56,
  intervals: 30,
  resources: {
    width: 120
  },
  grid: {
    x: 30,
    y: 56
  },
  resize: {
    minWidth: 50,
    minHeight: 50
  },
  events: {
    width: 240,
    height: 56,
    margin: 6,
  }
}
