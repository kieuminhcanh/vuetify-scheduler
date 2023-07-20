<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
import { PropType, computed, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { SchedulerOptions, SchedulerEvent, SchedulerResource, SchedulerDate, SchedulerEventsOptions, SchedulerResourcesOptions } from '../types'
import {
  VCard,
  VCardText,
  VSheet,
  VToolbar,
  VTable,
  VListItem,
  VCol,
  VList,
  VRow,
  VAppBar,
  VContainer,
  VDivider,
  VHover,
  VListItemTitle,
  VListItemSubtitle,
  VBtn,
  VSnackbar,
  VToolbarItems,
  VSpacer,
} from 'vuetify/components'

import { MouseDownResizer } from '../utils'
import { defaultOptions } from '../utils/options'
import deepMerge from 'deepmerge'
import { reactiveStyle } from '@vueuse/motion'
import VueDraggify from '../../../vue-draggify/src/components/Draggify.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: () => {
      return dayjs().format('YYYY-MM-DD')
    },
  },
  resources: {
    type: Array as PropType<
      {
        id: string | number
        name: string
      }[]
    >,
    default: () => [],
  },
  events: {
    type: Array as PropType<
      {
        id?: string | number
        resourceId: string | number
        start: string | Date | Dayjs
        end: string | Date | Dayjs
        [key: string]: any
      }[]
    >,
    default: () => [],
  },
  options: {
    type: Object,
    default: () => ({
      rowHeight: 56,
    }),
  },
})

const emit = defineEmits<{
  (e: 'dblclick:event', event: SchedulerEvent): void
  (e: 'update:modelValue', date: string | Dayjs | Date): void
  (e: 'update:event', event: SchedulerEvent): void
}>()

const dates = computed(() => ({
  from: dayjs(props.modelValue).set('hour', 9).set('minute', 0).set('second', 0),
  to: dayjs(props.modelValue).set('hour', 21).set('minute', 0).set('second', 0),
}))

const options = reactive<SchedulerOptions>(deepMerge(defaultOptions, props.options) as SchedulerOptions)

const pixelPerMinute = computed(() => {
  return (options?.events?.width as number) / options.intervals
})

const eventsSorted = computed(() => {
  let lastY = 0
  return [...props.resources]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((resource, resourceIndex) => {
      const eventItems = events.value
        .filter((event) => event.start.isBetween(dates.value.from, dates.value.to, 'minute', '[]'))
        .filter((event) => event.resourceId === resource.id)
        .sort((a, b) => {
          return a.start.isBefore(b.start) ? -1 : 1
        })
        .map((eventMap) => {
          eventMap.x = eventMap.x ?? Math.round(eventMap.start.diff(dates.value.from, 'minute') * pixelPerMinute.value)
          return eventMap
        })
        .reduce((eventsReduce: SchedulerEvent[], event, eventIndex) => {
          const prev = eventsReduce[eventIndex - 1]

          if (!prev) {
            event.y = lastY
          } else {
            if (event.start.isBetween(prev.start, prev.end, 'minute', '[)')) {
              event.y = (prev.y as number) + options.rowHeight
            } else {
              event.y = prev.y
            }
            lastY = event.y
          }
          return [...eventsReduce, event]
        }, [])

      lastY = lastY + options.rowHeight
      return { ...resource, ...{ events: eventItems } }
    }, []) as SchedulerResource[]
})

const { style: timeRangesStyle } = reactiveStyle({
  backgroundSize: `${options.events?.width}px`,
  backgroundImage: 'linear-gradient(to right, #c9c9c9 1px, transparent 1px)',
})

const { style: gridStyle } = reactiveStyle({
  backgroundSize: `100% ${options?.rowHeight}px`,
  'background-image': 'linear-gradient(to bottom, #000000 0px, transparent 0.5px)',
})

const { style: eventRowsStyle } = reactiveStyle({
  'background-size': `100% ${options?.rowHeight}px`,
  'background-image': 'linear-gradient(to right, #000000 0px, transparent 0.5px)',
  // 'background-size': `${options?.events.width}px ${options?.rowHeight}px`,
  // "background-image": 'linear-gradient(to right, #000000 0px, transparent 0.5px), linear-gradient(to right, #c9c9c9 1px, transparent 1px)'
})

const { style: eventStyle } = reactiveStyle({
  backgroundColor: '#ffffff',
  border: '1px solid #dddddd',
  borderRadius: '5px',
  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
  marginTop: options.events.margin + 'px',

})

const events = ref<SchedulerEvent[]>([])
// const events = ref<SchedulerEvent[]>(
//   props.events.map((event, index) => {
//     const start = dayjs(event.start)
//     const end = dayjs(event.end)

//     const item = {
//       ...event,
//       ...{ id: event.id || index + 1, start, end, width: end.diff(start, 'minute') * pixelPerMinute.value, height: options.rowHeight },
//     } as SchedulerEvent
//     console.log(item)

//     return item
//   }) as SchedulerEvent[]
// )

const eventsContainerRef = ref()

const onResourcesResize = (e: MouseEvent) => {
  MouseDownResizer(e, options?.resources?.width as number, (newWidth: any) => {
    if (options.resources) {
      options.resources.width = newWidth
    }
  })
}

watch(
  () => props.events,
  () => {
    console.log('watch events changed');

    events.value = props.events.map((event, index) => {
      const start = dayjs(event.start)
      const end = dayjs(event.end)

      const item = {
        ...event,
        ...{
          id: event.id || index + 1,
          start,
          end,
          width: end.diff(start, 'minute') * pixelPerMinute.value,
          height: options.rowHeight - options.events.margin * 2
        },
      } as SchedulerEvent
      console.log(item)

      return item
    }) as SchedulerEvent[]
    // events.value = props.events.map((event) => {
    //   return {
    //     ...event,
    //     start: dayjs(event.start),
    //     end: dayjs(event.end),
    //   } as SchedulerEvent
    // })
  }
)

const dateTimeRanges = computed<Dayjs[]>(() => {
  const ranges: Dayjs[] = []
  let start = dates.value.from.clone()
  let end = dates.value.to.clone()

  do {
    ranges.push(start)
    start = start.add(options.intervals, 'minute')
  } while (start.isSameOrBefore(end))

  return ranges
})

const eventsContainerSize = computed(() => {
  return {
    width: dateTimeRanges.value.length * (options?.events?.width as number),
    height: eventsSorted.value.reduce((height, resource) => (height += options.rowHeight * getHeightOfResource(resource)), 0),
  }
})

const getHeightOfResource = (resource: SchedulerResource) => {
  return resource.events.reduce((count: number, current: SchedulerEvent, index: number, array: SchedulerEvent[]) => {
    const prev = array[index - 1]
    if (prev && current.start.isBetween(prev.start, prev.end, 'minute', '[)')) {
      count++
    }
    return count
  }, 1)
}

const onMoveEnd = (e: MouseEvent, data: any, event: SchedulerEvent) => {
  const resource = getResourceFromHeight(data)
  if (!resource) {
    return
  }
  event.resourceId = resource.id
  event.x = data.x
  event.y = data.y
  event.width = data.width
  event.height = data.height
  event.start = dates.value.from.add(data.x / pixelPerMinute.value, 'minute')
  event.end = dates.value.from.add((data.x + data.width) / pixelPerMinute.value, 'minute')
  emit('update:event', event)
}

const onResizeMove = (e: MouseEvent, data: any, event: SchedulerEvent) => {
  event.x = data.x
  event.y = data.y
  event.width = data.width
  event.height = data.height
  event.start = dates.value.from.add(data.x / pixelPerMinute.value, 'minute')
  event.end = dates.value.from.add((data.x + data.width) / pixelPerMinute.value, 'minute')
}

const getResourceFromHeight = (data: any) => {
  let y = data.y
  const resource = eventsSorted.value.find((resource, index) => {
    y = y - options.rowHeight * getHeightOfResource(resource)
    if (y < 0) {
      return true
    }
    return false
  })

  return resource
}

const resourceActive = ref<SchedulerResource>()

const onMouseMove = (e: MouseEvent) => {
  const rect = eventsContainerRef.value.$el.getBoundingClientRect()
  const axis = {
    x: e.clientX,
    y: e.clientY,
  }
  const y = axis.y - rect.top
  const resource = getResourceFromHeight({ y })
  if (resource) {
    resourceActive.value = resource
  }
}

const getTimeDisplay = (x: number, width: number) => {
  let display = []
  display.push(dates.value.from.add((x as number) / pixelPerMinute.value, 'minute').format('HH:mm A'))
  display.push(dates.value.from.add(((x as number) + (width as number)) / pixelPerMinute.value, 'minute').format('HH:mm A'))
  return display.join(' - ')
}
</script>

<template>
  <VSheet height="100%" class="scheduler-container">
    <VToolbar>
      <VBtn icon="mdi-chevron-left"
        @click="emit('update:modelValue', dayjs(props.modelValue).add(-1, 'day').format('YYYY-MM-DD'))"> </VBtn>
      <VSpacer />
      <VBtn>{{ dates.from.format('ddd MM-DD') }}</VBtn>
      <VSpacer />
      <VBtn icon="mdi-chevron-right"
        @click="emit('update:modelValue', dayjs(props.modelValue).add(1, 'day').format('YYYY-MM-DD'))"></VBtn>
    </VToolbar>
    <VRow no-gutters class="h-100 overflow-auto">
      <VCol cols="auto" class="scheluder-resources-container">
        <!-- Resources Header -->
        <VSheet class="scheduler-header" :width="options?.resources?.width" :height="options.rowHeight">
          <VToolbar color="transparent" density="comfortable" title="Name" />
        </VSheet>
        <!-- Resources List -->
        <VSheet :width="options?.resources?.width" :style="gridStyle">
          <VSheet v-for="(resource, index) in eventsSorted" :key="resource.id"
            :color="resource.id === resourceActive?.id ? 'blue' : ''" class="scheduler-rows scheduler-resources-rows"
            :height="options.rowHeight * getHeightOfResource(resource)">
            <slot name="resource" v-bind="{ resource }">
              <VListItem :title="`${resource.id}: ${resource.name}`" lines="two" density="compact" />
            </slot>
          </VSheet>
        </VSheet>
      </VCol>
      <VCol cols="auto" class="scheduler-resizer-container">
        <!-- Resizer -->
        <VSheet width="6" height="100%" color="rgba(0, 0, 0, 0.5)" class="scheduler-resizer h-100"
          @mousedown="onResourcesResize">| </VSheet>
      </VCol>
      <!-- Events Container -->
      <VCol class="overflow-x-auto overflow-y-hidden scheduler-events-container">
        <!-- Events Header -Time Range -->
        <VSheet :width="eventsContainerSize.width" :height="options.rowHeight"
          class="d-flex align-center scheduler-header" :style="timeRangesStyle">
          <template v-for="item in dateTimeRanges">
            <VBtn :width="options?.events?.width" variant="text">{{ item.format('hh:mm A') }}</VBtn>
          </template>
        </VSheet>
        <!-- Events -->
        <VSheet :width="eventsContainerSize.width" :height="eventsContainerSize.height" class="scheduler-events"
          :style="gridStyle" ref="eventsContainerRef" @mousemove="onMouseMove">
          <template v-for="resource in eventsSorted">
            <template v-for="event in resource.events" :key="event.id">
              <!-- Event Item -->
              <VueDraggify :model-value="event" class="scheduler-events-item px-3" dragType="move"
                @on-move-end="($event: MouseEvent, data: any) => onMoveEnd($event, data, event)"
                @onResizeMove="($event: MouseEvent, data: any) => onResizeMove($event, data, event)"
                @onResizeEnd="emit('update:event', event)"
                :options="{ grid: { x: 30, y: 56 }, resize: { direction: 'x', disabled: true } }"
                @dblclick.stop="emit('dblclick:event', event)" :style="eventStyle">
                <template #top="{ x, width, isHovering }">
                  <VSheet v-if="isHovering" position="absolute" width="200" height="54"
                    class="elevation-2 d-flex align-center"
                    style="top: -60px; left: 0; right: 0; margin: 0 auto; z-index: 10000">
                    <VListItem nav lines="two">
                      <VListItemTitle>{{ event.text }}</VListItemTitle>
                      <VListItemSubtitle>{{ getTimeDisplay(x as number, width as number) }} </VListItemSubtitle>
                    </VListItem>
                  </VSheet>
                </template>
                <template #default="state">
                  <slot name="event" v-bind="{ ...state, item: event, pixelPerMinute }">
                    <div>
                      <div>{{ `${event.id} -${event.resourceId}: ${event.text} ` }}</div>
                      <div class="text-caption">
                        {{ dates.from.add((state.x as number) / pixelPerMinute, 'minute').format('HH:mm') }} -
                        {{ dates.from.add(((state.x as number) + (state.width as number)) / pixelPerMinute,
                          'minute').format('HH:mm') }}
                      </div>
                    </div>
                  </slot>
                </template>
              </VueDraggify>
            </template>
          </template>
          <!-- Event Rows -->
          <template v-for="(resource, resourceIndex) in eventsSorted" :key="resource.id">
            <!-- Event Row -->
            <VSheet :width="eventsContainerSize.width" :height="options.rowHeight * getHeightOfResource(resource)"
              class="scheduler-rows scheduler-events-rows" :style="eventRowsStyle"> </VSheet>
            <!-- Event Items -->
          </template>
        </VSheet>
      </VCol>
    </VRow>

    <!-- End Scheduler Body -->
  </VSheet>
</template>

<style lang="scss" scoped>
.scheduler-container {
  .scheduler-header {
    border-top: 1px solid #ccc;
    border-bottom: 3px solid #ccc;
  }

  .scheduler-rows {
    border-bottom: 1px solid #dddddd;
    transition: height 0.5s ease;
  }

  // Resources Container
  .scheluder-resources-container {
    user-select: none;

    .scheduler-resources-rows {
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
  }

  .scheduler-resizer-container {
    .scheduler-resizer {
      cursor: ew-resize;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }
  }

  .scheduler-events-container {
    .scheduler-events {
      position: relative;
      border-top: 1px solid #dddddd;

      .scheduler-events-rows {
        position: relative;

        &:hover {
          background-color: #f9f9f9;
        }

        &.scheduler-events-rows--dragover {
          border-bottom: 1px solid #aaaaaa;
        }
      }

      .scheduler-events-item {
        position: absolute;
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        z-index: 1;
      }
    }
  }
}
</style>
