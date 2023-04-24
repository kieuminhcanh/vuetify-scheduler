<template>
  <VSheet height="100%">
    <!-- Header -->
    <VRow no-gutters>
      <VCol cols="auto">
        <VSheet :width="_options?.resources?.width">
          <VToolbar color="transparent" density="comfortable" title="Name" />
        </VSheet>
      </VCol>
      <VCol cols="auto">
        <VSheet width="6" height="100%" color="rgba(0, 0, 0, 0.5)" class="scheduler-resizer text-white h-100"
          @mousedown="onResourcesResize">|
        </VSheet>
      </VCol>
      <VCol class="overflow-hidden" ref="eventTimeRangeContainerRef">
        <VSheet :width="eventsContainerSize.width" :height="_options.rowHeight" class="d-flex align-center"
          :style="timeRangesStyles">
          <template v-for="(item) in dateTimeRanges">
            <VBtn :width="_options?.events?.width" variant="text">{{ item.format("hh A") }}</VBtn>
          </template>
        </VSheet>
      </VCol>
    </VRow>
    <!-- End Header -->
    <!-- Scheduler Body -->
    <VRow no-gutters class="h-100 overflow-auto">
      <VCol cols="auto">
        <VSheet :width="_options?.resources?.width" :style="gridStyles" class="scheluder-resources-container">
          <VSheet v-for="(resource, index) in resources" class="scheduler-resources-rows"
            :height="_options.rowHeight * resource.countOverlappingAppointments">
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
          <template v-for="(resource, resourceIndex) in resources">
            <VSheet :width="eventsContainerSize.width"
              :height="_options.rowHeight * resource.countOverlappingAppointments" draggable
              :data-resource-index="resourceIndex" class="scheduler-events-rows" ref="eventsContainerRef">
              <template v-for="(event, eventIndex) in resource.events.value">
                <vue-draggify :modelValue="{
                    width: event.width,
                    height: _options.rowHeight,
                    x: event.x,
                    y: event.y,
                  }" :options="{
      container: eventsContainerSize,
      grid: {
        x: Math.round(_options?.events?.width / 4),
        y: _options.rowHeight
      },
      resize: {
        direction: 'x'
      }
    }" @onDragOver="($event: DragEvent, data: any) => onDragOver($event, data, event)" @onDragLeave="onDragLeave"
                  @onDragEnd="($event: DragEvent, data: DraggifyState) => onDragEnd($event, data, resourceIndex, eventIndex)"
                  @onDrop="($event: DragEvent, data: DraggifyState) => onDrop($event, data, resourceIndex, eventIndex)"
                  @onResizeMove="($event: MouseEvent, data: DraggifyState) => onResizeMove($event, data, resourceIndex, eventIndex)"
                  v-slot="{ x, y }">

                  <VListItem density="compact" lines="three">
                    <VListItemTitle>{{ event.text }}</VListItemTitle>
                    <VListItemSubtitle>{{ `${event.start.format('HH:mm')}-${event.end.format('HH:mm')}` }} - {{ x }}
                    </VListItemSubtitle>
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

<script setup lang="ts">
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

  let event = resources.value[resourceIndex].events.value[eventIndex];
  let newResourceIndex: any = targetElement.getAttribute('data-resource-index');

  if (newResourceIndex) {
    const pixelPerMinute = (_options?.events?.width as number) / 60
    const startMinute = Math.round(((event?.x as number) - (data?.x as number)) / pixelPerMinute)
    const eventRight = event?.x as number + (event?.width as number)
    const dataRight = data?.x as number + (data?.width as number)
    const endMinute = Math.round((eventRight - dataRight) / pixelPerMinute)

    event.width = data.width
    event.height = data.height
    event.x = data.x
    event.start = event.start.add(-startMinute, 'minute')
    event.end = event.end.add(-endMinute, 'minute')
    event.y = 0

    resources.value[newResourceIndex].events.value.push(event)
    resources.value[resourceIndex].events.value.splice(eventIndex, 1);

    resources.value[newResourceIndex].events.value.sort((a, b) => {
      return a.start.diff(b.start)
    }).map((event, index, events) => {
      if (index === 0) {
        event.y = 0
      } else {
        const prev = events[index - 1]
        if (event.start.isBetween(prev.start, prev.end, "minute", "[)")) {
          event.y = prev.y as number + _options.rowHeight
        } else {
          event.y = 0
        }
      }
    })
  }
};

const onDragEnd = (ev: any, data: DraggifyState, resourceIndex: number, eventIndex: number) => {
  const targetElement = ev.target as HTMLElement;

  if (targetElement.classList.contains('scheduler-event-rows')) {
    ev.preventDefault();
    targetElement.classList.remove('scheduler-event-rows--dragover');
  }
};

const onResizeMove = (e: MouseEvent, data: any, resourceIndex: number, eventIndex: number) => {
  e.preventDefault();
  const event = resources.value[resourceIndex].events.value[eventIndex];
  const pixelPerMinute = (_options?.events?.width as number) / 60
  const startMinute = Math.round(((event?.x as number) - (data?.x as number)) / pixelPerMinute)
  const eventRight = event?.x as number + (event?.width as number)
  const dataRight = data?.x as number + (data?.width as number)
  const endMinute = Math.round((eventRight - dataRight) / pixelPerMinute)

  event.width = data.width
  event.height = data.height
  event.x = data.x
  event.start = event.start.add(-startMinute, 'minute')
  event.end = event.end.add(-endMinute, 'minute')
};

const debouncedFn = useDebounceFn(() => {

}, 1000)

const _options = reactive<SchedulerOptions>(deepMerge(defaultOptions, props.options) as SchedulerOptions)

const pixelPerMinute = computed(() => {
  return (_options?.events?.width as number) / 60
})

const timeRangesStyles = computed(() => {
  return {
    'background-size': `${_options.events?.width}px`,
    'background-image': 'linear-gradient(to right, #c9c9c9 1px, transparent 1px)'
  }
})
const gridStyles = computed(() => {
  return {
    'background-image': 'linear-gradient(to bottom, #000000 0px, transparent 0.5px)',
    'background-size': `100% ${_options?.rowHeight}px`,
  }
})

// Bị lỗi không tự động scale khi thay đổi resourceId
const resources = computed(() => {
  return props.resources
    .reduce((resultResources: Resource[], resource: any, resourceIndex: number) => {
      let maxTop = 0
      const events = props.events.filter(event => event.resourceId === resource.id).map((event, index) => {
        const start = dayjs(event.start)
        const end = dayjs(event.end)
        const startPoint = Math.round((start.diff(props.dates.from, 'minute')) * pixelPerMinute.value)
        const endPoint = Math.round(end.diff(props.dates.from, 'minute') * pixelPerMinute.value)
        return {
          ...event,
          start,
          end,
          width: endPoint - startPoint,
          height: (_options?.rowHeight as number),
        } as Event
      }).sort((a, b) => a.start.diff(b.start)).map((event, index, events) => {

        event.x = Math.round((event.start.diff(props.dates.from, 'minute')) * pixelPerMinute.value)

        if (index === 0) {
          event.y = 0
        } else {
          const prev = events[index - 1]

          if (event.start.isBetween(prev.start, prev.end, 'minute', "[]") || event.end.isBetween(prev.start, prev.end, 'minute', "[]")) {
            event.y = prev.y as number + _options.rowHeight
          } else {
            event.y = 0
          }
        }
        return event
      })
      resultResources.push(new Resource({
        ...resource,
        events: events
      }))
      return resultResources
    }, [] as Resource[])
})


const eventTimeRangeContainerRef = ref()
const onScrollText = (state: UseScrollReturn) => {
  eventTimeRangeContainerRef.value.$el.scrollLeft = state.x.value
}

const onResourcesResize = (e: MouseEvent) => {
  MouseDownResizer(e, (_options?.resources?.width as number), (newWidth: any) => {
    if (_options.resources) {
      _options.resources.width = newWidth
    }
  })
};

const dateTimeRanges = computed<Dayjs[]>(() => {

  let item = dayjs(props.dates.from)
  let diff = dayjs(props.dates.to).diff(dayjs(props.dates.from), 'hour')

  return Array.from({ length: diff + 1 }, (v, i) => i).map((i) => item.add(i, 'hour'))
})

const eventsContainerSize = computed(() => {
  return {
    width: (dateTimeRanges.value.length + 1) * (_options?.events?.width as number),
    height: props.resources.length * (_options?.rowHeight as number)
  }
})


const eventOptions = {
  style: {
    marginY: 10
  },
  resize: {
    direction: 'x',
    color: '#00ff89'
  },
  container: {
    width: eventsContainerSize.value.width,
    height: eventsContainerSize.value.height
  },
  grid: { x: (_options?.events?.width as number) / 4, y: _options.rowHeight, stickToGrid: true }
}

</script>

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
