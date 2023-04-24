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
        <VSheet :width="_options?.resources?.width" :style="gridStyles">
          <VSheet v-for="(resource, index) in _resources" class="d-flex align-center"
            :height="(_options.rowHeight as number) * resource.maxSameStartEvents">
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
        <VSheet class="scheluder-events-container" :style="gridStyles" :width="eventsContainerSize.width"
          :height="eventsContainerSize.height">
          <template v-for="(resource, resourceIndex) in _resources">
            <VSheet :width="eventsContainerSize.width" :height="_resourcesHeight[resourceIndex]" color="blue"
              style="border-bottom: 1px solid red">
            </VSheet>
            <VueDraggify v-for="(event, eventIndex) in resource.events.value" :modelValue="event" :options="eventOptions"
              :onResizeMove="($event: DraggifyState) => onChangeEvent($event, event, eventIndex)"
              :onDragMove="($event: DraggifyState) => onChangeEvent($event, event, eventIndex)">
              <VListItem lines="two" nav density="compact" :title="`${event.resourceId}: ${event.text}`"
                :subtitle="`${(event.start as Dayjs).format('HH:mm')} - ${(event.end as Dayjs).format('HH:mm')}`">
              </VListItem>
            </VueDraggify>
          </template>
        </VSheet>
      </VCol>
    </VRow>
    <!-- End Scheduler Body -->
  </VSheet>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { PropType, computed, reactive, ref } from 'vue';
import { SchedulerOptions, SchedulerEvent, SchedulerResource, SchedulerDate, SchedulerEventsOptions, SchedulerResourcesOptions } from "../types";
import { VCard, VCardText, VSheet, VToolbar, VTable, VListItem, VCol, VList, VRow, VAppBar, VContainer, VDivider } from "vuetify/components";
import { vScroll } from '@vueuse/components'

import { MouseDownResizer } from "../utils";
import { UseScrollReturn, useDebounceFn } from '@vueuse/core';
import { defaultOptions } from "../utils/options";
import deepMerge from "deepmerge";
import { DraggifyState } from '../../../vue-draggify/src/types';
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

const _resourcesHeight = computed(() => {
  return _resources.value.map(resource => resource.maxSameStartEvents * (_options.rowHeight as number))
})

const debouncedFn = useDebounceFn(() => {

}, 1000)

const _options = reactive<SchedulerOptions>(deepMerge(defaultOptions, props.options) as SchedulerOptions)

const pixelPerMinute = computed(() => {
  return (_options?.events?.width as number) / 60
})

const onChangeEvent = (data: DraggifyState, event: Event, index: number) => {

  // debouncedFn();
  const pixelPerMinute = (_options?.events?.width as number) / 60
  const startMinute = Math.round(((event?.left as number) - (data?.left as number)) / pixelPerMinute)

  const resourceIndex = (data.top as number) / (_options.rowHeight as number)


  const endMinute = Math.round(((event?.right as number) - (data?.right as number)) / pixelPerMinute)
  console.log(event);

  event.start = (event.start as Dayjs).add(-startMinute, 'minute')
  event.x = data.left as number
  event.end = (event.end as Dayjs).add(-endMinute, 'minute')
  event.width = data.width
  event.resourceId = props.resources[resourceIndex].id
}

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
const _resources = computed(() => {
  let maxTop = 0
  return props.resources
    .reduce((resultResources: Resource[], resource: any, resourceIndex: number) => {
      const events = props.events.filter(event => event.resourceId === resource.id)
      if (!events.length) {
        maxTop += _options.rowHeight as number
      }
      resultResources.push(new Resource({
        ...resource,
        events: events.reduce((resultEvents: Event[], event: any, eventIndex) => {
          const start = dayjs(event.start)
          const end = dayjs(event.end)
          const startPoint = Math.round((start.diff(props.dates.from, 'minute')) * pixelPerMinute.value)
          const endPoint = Math.round(end.diff(props.dates.from, 'minute') * pixelPerMinute.value)

          const prevResource = resourceIndex > 0 ? resultResources[resourceIndex - 1] : null;
          const prevEvent = eventIndex > 0 ? resultEvents[eventIndex - 1] : null;


          let y = 0
          if (!prevResource) {
            if (prevEvent && start.isSame(prevEvent.start, 'minute')) {
              y = prevEvent.y + _options.rowHeight
              maxTop = y
            } else {
              y = maxTop
            }
          } else {
            if (!prevEvent) {
              y = maxTop + _options.rowHeight
              maxTop = y
            } else if (prevEvent && start.isSame(prevEvent.start, 'minute')) {
              y = prevEvent.y + _options.rowHeight
              maxTop = y
            } else {
              y = maxTop
            }
          }

          resultEvents.push(new Event(
            {
              ...event,
              start,
              end,
              width: endPoint - startPoint,
              height: (_options?.rowHeight as number),
              x: Math.round((start.diff(props.dates.from, 'minute')) * pixelPerMinute.value),
              y: y
            }
          ))

          return resultEvents
        }, [])
      }))
      return resultResources
    }, [] as Resource[])
})

console.log(_resources.value);

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

.scheluder-events-container {
  position: relative;

  .scheduler-event {
    position: absolute;

    .scheduler-event-resize {
      cursor: ew-resize;
    }
  }
}
</style>
