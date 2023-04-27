

<script setup lang="ts">
import VueDraggify from "../../../vue-draggify/src/components/DraggifyEager.vue";
import dayjs, { Dayjs } from 'dayjs';
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import { PropType, computed, onMounted, reactive, ref } from 'vue';
import { SchedulerOptions, SchedulerEvent, SchedulerResource, SchedulerDate, SchedulerEventsOptions, SchedulerResourcesOptions } from "../types";
import { VCard, VCardText, VSheet, VToolbar, VTable, VListItem, VCol, VList, VRow, VAppBar, VContainer, VDivider, VHover, VListItemTitle, VListItemSubtitle } from "vuetify/components";
import { vScroll } from '@vueuse/components'

import { MouseDownResizer } from "../utils";
import { UseScrollReturn, useDebounceFn } from '@vueuse/core';
import { defaultOptions } from "../utils/options";
import deepMerge from "deepmerge";
import { DraggifyDirection, DraggifyState } from '../../../vue-draggify/src/types';
import { Resource } from '../types/resource';
import { Event } from '../types/event';
import { reactiveStyle } from "@vueuse/motion";

const props = defineProps({
  dates: {
    type: Object as PropType<SchedulerDate>,
    default: () => {
      return {
        from: dayjs().set('hour', 6).set('minute', 0).set('second', 0),
        to: dayjs().set('hour', 18).set('minute', 0).set('second', 0)
      }
    }
  },
  resources: {
    type: Array as PropType<SchedulerResource[]>,
    default: () => []
  },
  events: {
    type: Array as PropType<SchedulerEvent[]>,
    default: () => []
  },
  options: {
    type: Object as PropType<SchedulerOptions>,
    default: () => ({
      rowHeight: 56
    })
  },
})

const dates = ref({
  from: dayjs(props.dates.from),
  to: dayjs(props.dates.to)
})

const eventsContainerRef = ref<HTMLElement>();

const onDragOver = (ev: any, data: DraggifyState, event: Event) => {
  const targetElement = ev.target as HTMLElement;

  if (targetElement.classList.contains('scheduler-events-rows')) {
    targetElement.classList.add('scheduler-events-rows--dragover');
  }
};
const onDragLeave = (ev: any, data: DraggifyState) => {
  ev.preventDefault();

  const targetElement = ev.target as HTMLElement;

  if (targetElement.classList.contains('scheduler-events-rows')) {
    targetElement.classList.remove('scheduler-events-rows--dragover');
  }
};
const onDrop = (ev: any, data: DraggifyState, resourceIndex: number, eventIndex: number) => {
  let targetElement = ev.target as HTMLElement;

  if (!targetElement.classList.contains('scheduler-events-rows')) {
    targetElement = targetElement.closest(".scheduler-events-rows") as HTMLElement;
  }

  console.log('on drop');


  if (!targetElement) {
    return;
  }

  let event: any = resources.value[resourceIndex].events[eventIndex];
  console.log(event);

  let resourceId = targetElement.dataset.resourceId;
  if (resourceId) {
    event.resourceId = resourceId
  }

  event = {
    ...event, ...{
      width: data.width,
      height: data.height,
      x: data.x,
      start: dates.value.from.add(data.x / pixelPerMinute.value, 'minute'),
      end: dates.value.from.add((data.x + data.width) / pixelPerMinute.value, 'minute'),
      y: 0
    }
  }




  const eventIndexOriginal = events.value.findIndex(item => item.id === event.id)
  events.value[eventIndexOriginal] = { ...event }
};

const onDragEnd = (ev: any, data: DraggifyState, resourceIndex: number, eventIndex: number) => {
  const targetElement = ev.target as HTMLElement;

  if (targetElement.classList.contains('scheduler-event-rows')) {
    ev.preventDefault();
    targetElement.classList.remove('scheduler-event-rows--dragover');
  }
};

const onResizeEnd = (e: MouseEvent, data: any, resourceIndex: number, eventIndex: number) => {
  e.preventDefault();

  let event: any = resources.value[resourceIndex].events[eventIndex];

  event = {
    ...event, ...{
      width: data.width,
      height: data.height,
      x: data.x,
      start: dates.value.from.add(data.x / pixelPerMinute.value, 'minute'),
      end: dates.value.from.add((data.x + data.width) / pixelPerMinute.value, 'minute'),
      y: 0
    }
  }

  const eventIndexOriginal = events.value.findIndex(item => item.id === event.id)
  events.value[eventIndexOriginal] = { ...event }

};

const debouncedFn = useDebounceFn(() => {

}, 1000)

const options = reactive<SchedulerOptions>(deepMerge(defaultOptions, props.options) as SchedulerOptions)

const pixelPerMinute = computed(() => {
  return (options?.events?.width as number) / 60
})


const { style: timeRangesStyles } = reactiveStyle({
  backgroundSize: `${options.events?.width}px`,
  backgroundImage: 'linear-gradient(to right, #c9c9c9 1px, transparent 1px)'
})

const { style: gridStyles } = reactiveStyle({
  backgroundSize: `100% ${options?.rowHeight}px`,
  'background-image': 'linear-gradient(to bottom, #000000 0px, transparent 0.5px)',
})

const events = ref<SchedulerEvent[]>(props.events.map((event, index) => ({
  ...event,
  id: event.id || index + 1,
  start: dayjs(event.start),
  end: dayjs(event.end),
})))

const resources = computed<Resource[]>(() => {
  const resourcesSorted = props.resources.map((resource, resourceIndex) => {
    const items = events.value
      .filter(eventFilter => eventFilter.resourceId === resource.id)
      .sort((a, b) => {
        return a.start.isAfter(b.start) ? 1 : -1
      })
      .map((eventMap, eventIndex) => {
        eventMap.x = eventMap.x ?? Math.round((eventMap.start.diff(dates.value.from, 'minute')) * pixelPerMinute.value)
        eventMap.width = eventMap.end.diff(eventMap.start, 'minute') * pixelPerMinute.value
        eventMap.height = options.rowHeight
        return eventMap
      }).reduce((eventsReduce: SchedulerEvent[], event, eventIndex) => {


        const prev = eventsReduce[eventIndex - 1]

        if (!prev) {
          event.y = 0
        } else {
          if (event.start.isBetween(prev.start, prev.end, 'minute', "[)")) {
            event.y = prev.y as number + options.rowHeight
          } else {
            event.y = prev.y
          }
        }
        console.log({
          id: event.id,
          start: event.start.format('HH:mm'),
          end: event.end.format('HH:mm'),
          x: event.x,
          y: event.y,
          width: event.width,
          height: event.height,
        });

        return [
          ...eventsReduce,
          event
        ]
      }, [])
    return new Resource({
      ...resource,
      events: items
    })
  }) as Resource[]
  console.log(resourcesSorted);

  return resourcesSorted
})

const getResources = () => {
  return resources.value;
};


const eventTimeRangeContainerRef = ref()
const onScrollText = (state: UseScrollReturn) => {
  eventTimeRangeContainerRef.value.$el.scrollLeft = state.x.value
}

const onResourcesResize = (e: MouseEvent) => {
  MouseDownResizer(e, (options?.resources?.width as number), (newWidth: any) => {
    if (options.resources) {
      options.resources.width = newWidth
    }
  })
};

const dateTimeRanges = computed<Dayjs[]>(() => {

  let item = dayjs(dates.value.from)
  let diff = dayjs(dates.value.to).diff(dayjs(dates.value.from), 'hour')

  return Array.from({ length: diff + 1 }, (v, i) => i).map((i) => item.add(i, 'hour'))
})

const eventsContainerSize = computed(() => {
  return {
    width: (dateTimeRanges.value.length + 1) * (options?.events?.width as number),
    height: props.resources.length * (options?.rowHeight as number)
  }
})

</script>

<template>
  <VSheet height="100%">
    <!-- Header -->
    <VRow no-gutters>
      <VCol cols="auto">
        <VSheet :width="options?.resources?.width">
          <VToolbar color="transparent" density="comfortable" title="Name" />
        </VSheet>
      </VCol>
      <VCol cols="auto">
        <VSheet width="6" height="100%" color="rgba(0, 0, 0, 0.5)" class="scheduler-resizer text-white h-100"
          @mousedown="onResourcesResize">|
        </VSheet>
      </VCol>
      <VCol class="overflow-hidden" ref="eventTimeRangeContainerRef">
        <VSheet :width="eventsContainerSize.width" :height="options.rowHeight" class="d-flex align-center"
          :style="timeRangesStyles">
          <template v-for="(item) in dateTimeRanges">
            <VBtn :width="options?.events?.width" variant="text">{{ item.format("hh A") }}</VBtn>
          </template>
        </VSheet>
      </VCol>
    </VRow>
    <!-- End Header -->
    <!-- Scheduler Body -->
    <VRow no-gutters class="h-100 overflow-auto">
      <VCol cols="auto">
        <VSheet :width="options?.resources?.width" :style="gridStyles" class="scheluder-resources-container">
          <VSheet v-for="(resource, index) in resources" class="scheduler-resources-rows"
            :height="options.rowHeight * resource.countOverlappingAppointments">
            <VListItem :title="`${resource.id}: ${resource.name}`" lines="two" density="compact" />
          </VSheet>
        </VSheet>
      </VCol>
      <VCol cols="auto">
        <VSheet width="6" height="100%" color="rgba(0, 0, 0, 0.5)" class="scheduler-resizer h-100"
          @mousedown="onResourcesResize">|
        </VSheet>
      </VCol>
      <VCol class="overflow-x-auto overflow-y-hidden" v-scroll="onScrollText">
        <VSheet :width="eventsContainerSize.width" :height="eventsContainerSize.height" class="scheluder-events-container"
          :style="gridStyles">
          <template v-for="(resource, resourceIndex) in getResources()">
            <VSheet :width="eventsContainerSize.width" :height="options.rowHeight * resource.countOverlappingAppointments"
              draggable :data-resource-id="resource.id" class="scheduler-events-rows" ref="eventsContainerRef">
              <template v-for="(event, eventIndex) in resource.events">
                <vue-draggify :modelValue="{
                    width: event.width,
                    height: options.rowHeight,
                    x: event.x,
                    y: event.y,
                  }" :options="{
      container: {
        width: eventsContainerSize.width,
        height: options.rowHeight * resource.countOverlappingAppointments
      },
      grid: {
        stickToGrid: true,
        x: Math.round(options?.events?.width / 4),
        y: options.rowHeight
      },
      resize: {
        direction: 'x'
      }
    }" @onDragLeave="onDragLeave"
                  @onDragEnd="($event: DragEvent, data: DraggifyState) => onDragEnd($event, data, resourceIndex, eventIndex)"
                  @onDrop="($event: DragEvent, data: DraggifyState) => onDrop($event, data, resourceIndex, eventIndex)"
                  @onResizeEnd="($event: MouseEvent, data: DraggifyState) => onResizeEnd($event, data, resourceIndex, eventIndex)">

                  <VListItem density="compact" lines="three">
                    <VListItemTitle>{{ event.text }}</VListItemTitle>
                    <VListItemSubtitle>{{ `${event.start.format('HH:mm')}-${event.end.format('HH:mm')}` }}
                    </VListItemSubtitle>
                    <!-- <VListItemSubtitle>{{ resource.countOverlappingAppointments }}</VListItemSubtitle> -->
                  </VListItem>
                </vue-draggify>
              </template>
            </VSheet>
          </template>
        </VSheet>

      </VCol>
    </VRow>
    <!-- End Scheduler Body -->
  </VSheet>
</template>

<style lang="scss" scoped>
.scheduler-resizer {
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scheluder-resources-container {
  border-top: 1px solid #dddddd;

  .scheduler-resources-rows {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #dddddd;
  }
}

.scheluder-events-container {
  position: relative;
  border-top: 1px solid #dddddd;

  .scheduler-events-rows {
    position: relative;
    border-bottom: 1px solid #dddddd;

    &.scheduler-events-rows--dragover {
      border-bottom: 1px solid #aaaaaa;
    }

    .scheduler-item {
      position: absolute;
    }
  }

  .scheduler-event {
    position: absolute;

    .scheduler-event-resize {
      cursor: ew-resize;
    }
  }
}
</style>
