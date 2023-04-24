import dayjs, { Dayjs } from "dayjs";

export interface EventInput {
  id: number | string;
  resourceId: number | string;
  start: dayjs.ConfigType;
  end: dayjs.ConfigType;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  title?: string;
  text: string;
}

export class Event implements EventInput {
  constructor({ id, resourceId, start, end, width, height, x = 0, y = 0, title, text }: EventInput) {
    this.id = id;
    this.resourceId = resourceId;
    this.start = dayjs(start);
    this.end = dayjs(end);
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.title = title;
    this.text = text;
  }

  id: string | number;
  resourceId: string | number;
  start: Dayjs;
  end: Dayjs;
  width?: number | undefined;
  height?: number | undefined;
  x?: number | undefined;
  y?: number | undefined;
  title?: string | undefined;
  text: string;


  get top(): number {
    return this.y as number;
  }

  get right(): number {
    return this.x as number + (this.width as number);
  }

  get bottom(): number {
    return this.y as number + (this.height as number);
  }

  get left(): number {
    return this.x as number;
  }
}
