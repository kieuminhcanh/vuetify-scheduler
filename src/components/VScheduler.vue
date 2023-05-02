

<script setup lang="ts">
import VueDraggify from "../../../vue-draggify/src/components/DraggifyMove.vue";
import dayjs, { Dayjs } from 'dayjs';
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import { PropType, computed, onMounted, reactive, ref } from 'vue';
import { SchedulerOptions, SchedulerEvent, SchedulerResource, SchedulerDate, SchedulerEventsOptions, SchedulerResourcesOptions } from "../types";
import { VCard, VCardText, VSheet, VToolbar, VTable, VListItem, VCol, VList, VRow, VAppBar, VContainer, VDivider, VHover, VListItemTitle, VListItemSubtitle, VBtn, VSnackbar, VToolbarItems, VSpacer } from "vuetify/components";

import { MouseDownResizer } from "../utils";
import { defaultOptions } from "../utils/options";
import deepMerge from "deepmerge";
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

const options = reactive<SchedulerOptions>(deepMerge(defaultOptions, props.options) as SchedulerOptions)

const pixelPerMinute = computed(() => {
  return (options?.events?.width as number) / 60
})

const eventsSorted = computed(() => {
  let lastY = 0
  const test = props.resources.sort((a, b) => a.name.localeCompare(b.name)).map((resource, resourceIndex) => {

    const eventItems = events.value.filter(event => event.start.isBetween(dates.value.from, dates.value.to, 'minute', "[]")).filter(event => event.resourceId === resource.id)
      .sort((a, b) => {
        return a.start.isBefore(b.start) ? -1 : 1
      })
      .map((eventMap) => {
        eventMap.x = eventMap.x ?? Math.round((eventMap.start.diff(dates.value.from, 'minute')) * pixelPerMinute.value)
        return eventMap
      }).reduce((eventsReduce: SchedulerEvent[], event, eventIndex) => {


        const prev = eventsReduce[eventIndex - 1]

        if (!prev) {
          event.y = lastY
        } else {

          if (event.start.isBetween(prev.start, prev.end, 'minute', "[)")) {
            event.y = prev.y as number + options.rowHeight
          } else {
            event.y = prev.y
          }
          lastY = event.y
        }
        return [
          ...eventsReduce,
          event
        ]
      }, [])

    lastY = lastY + options.rowHeight
    return { ...resource, ...{ events: eventItems } }
  }, [])

  return test as SchedulerResource[]
})

const { style: timeRangesStyle } = reactiveStyle({
  backgroundSize: `${options.events?.width}px`,
  backgroundImage: 'linear-gradient(to right, #c9c9c9 1px, transparent 1px)'
})

const { style: gridStyle } = reactiveStyle({
  backgroundSize: `100% ${options?.rowHeight}px`,
  'background-image': 'linear-gradient(to bottom, #000000 0px, transparent 0.5px)',
})

const { style: eventRowsStyle } = reactiveStyle({
  'background-size': `100% ${options?.rowHeight}px`,
  "background-image": 'linear-gradient(to right, #000000 0px, transparent 0.5px)'
  // 'background-size': `${options?.events.width}px ${options?.rowHeight}px`,
  // "background-image": 'linear-gradient(to right, #000000 0px, transparent 0.5px), linear-gradient(to right, #c9c9c9 1px, transparent 1px)'
})

const events = ref<SchedulerEvent[]>(props.events.map((event, index) => {
  const start = dayjs(event.start)
  const end = dayjs(event.end)
  return {
    ...event,
    id: event.id || index + 1,
    start,
    end,
    width: end.diff(start, 'minute') * pixelPerMinute.value,
    height: options.rowHeight
  }
}))

const eventsContainerRef = ref()

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
    width: dateTimeRanges.value.length * (options?.events?.width as number),
    height: eventsSorted.value.reduce((height, resource) => height += options.rowHeight * getHeightOfResource(resource), 0)
  }
})

const getHeightOfResource = (resource: SchedulerResource) => {

  return resource.events.reduce((count: number, current: SchedulerEvent, index: number, array: SchedulerEvent[]) => {

    const prev = array[index - 1];
    if (prev && current.start.isBetween(prev.start, prev.end, "minute", "[)")) {
      count++;
    }
    return count;
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
    y: e.clientY
  }
  const y = axis.y - rect.top
  const resource = getResourceFromHeight({ y })
  if (resource) {
    resourceActive.value = resource
  }

}

const getTimeDisplay = (x: number, width: number) => {
  let display = [];
  display.push(dates.value.from.add(x as number / pixelPerMinute.value, 'minute').format('HH:mm A'));
  display.push(dates.value.from.add(((x as number) + (width as number)) / pixelPerMinute.value, 'minute').format("HH:mm A"))
  return display.join(' - ')
}

const changeDate = (name: "next" | "prev") => {
  switch (name) {
    case "next":
      dates.value.from = dates.value.from.add(1, 'day')
      dates.value.to = dates.value.to.add(1, 'day')
      break;
    case "prev":
      dates.value.from = dates.value.from.subtract(1, 'day')
      dates.value.to = dates.value.to.subtract(1, 'day')
      break;
  }
}
</script>

<template>
  <VSheet height="100%" class="scheduler-container">
    <VToolbar>
      <VBtn icon="mdi-chevron-left" @click="changeDate('prev')"></VBtn>
      <VSpacer />
      <VBtn>{{ dates.from.format("ddd MM-DD") }}</VBtn>
      <VSpacer />
      <VBtn icon="mdi-chevron-right" @click="changeDate('next')"></VBtn>
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
            :color="resource.id === resourceActive?.id ? 'blue' : ''" class="scheduler-rows scheduler-resources-rows "
            :height="options.rowHeight * getHeightOfResource(resource)">
            <VListItem :title="`${resource.id}: ${resource.name}`" lines="two" density="compact" />
          </VSheet>
        </VSheet>
      </VCol>
      <VCol cols="auto" class="scheduler-resizer-container">
        <!-- Resizer -->
        <VSheet width="6" height="100%" color="rgba(0, 0, 0, 0.5)" class="scheduler-resizer h-100"
          @mousedown="onResourcesResize">|
        </VSheet>
      </VCol>
      <!-- Events Container -->
      <VCol class="overflow-x-auto overflow-y-hidden scheduler-events-container">
        <!-- Events Header -Time Range -->
        <VSheet :width="eventsContainerSize.width" :height="options.rowHeight"
          class="d-flex align-center scheduler-header" :style="timeRangesStyle">

          <template v-for="(item) in dateTimeRanges">
            <VBtn :width="options?.events?.width" variant="text">{{ item.format("hh A") }}</VBtn>
          </template>
        </VSheet>
        <!-- Events -->
        <VSheet :width="eventsContainerSize.width" :height="eventsContainerSize.height" class="scheduler-events"
          :style="gridStyle" ref="eventsContainerRef" @mousemove="onMouseMove">
          <template v-for="(resource) in eventsSorted">
            <template v-for="(event) in resource.events" :key="event.id">
              <!-- Event Item -->
              <VueDraggify :model-value="event" class="scheduler-events-item px-3"
                @on-mouse-up="($event, data) => onMoveEnd($event, data, event)"
                :options="{ grid: { x: 30, y: 56 }, resize: { direction: 'x' } }">
                <template #top="{ x, width, isHovering }">
                  <VSheet v-if="isHovering" position="absolute" width="200" height="54"
                    class="elevation-2 d-flex align-center"
                    style="top: -60px;left: 0; right: 0; margin: 0 auto; z-index: 10000;">
                    <VListItem nav lines="two">
                      <VListItemTitle>{{ event.text }}</VListItemTitle>
                      <VListItemSubtitle>{{ getTimeDisplay(x as number, width as number) }}
                      </VListItemSubtitle>
                    </VListItem>
                  </VSheet>
                </template>
                <template #default="{ x, width }">
                  <div>
                    <div>{{ `${event.id} -${event.resourceId}: ${event.text} ` }} </div>
                    <div class="text-caption">
                      {{ dates.from.add(x as number / pixelPerMinute, 'minute').format("HH:mm") }} -
                      {{ dates.from.add(((x as number) + (width as number)) / pixelPerMinute, 'minute').format("HH:mm")
                      }}
                    </div>
                  </div>
                </template>
              </VueDraggify>
            </template>
          </template>
          <!-- Event Rows -->
          <template v-for="(    resource, resourceIndex    ) in     eventsSorted    " :key="resource.id">
            <!-- Event Row -->
            <VSheet :width="eventsContainerSize.width" :height="options.rowHeight * getHeightOfResource(resource)"
              class="scheduler-rows scheduler-events-rows" :style="eventRowsStyle">
            </VSheet>
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
    border-bottom: 3px solid #ccc;
  }

  .scheduler-rows {
    border-bottom: 1px solid #dddddd;
    transition: height 0.5s ease;
  }

  // Resources Container
  .scheluder-resources-container {
    border-top: 1px solid #dddddd;
    user-select: none;

    .scheduler-resources-rows {
      display: flex;
      align-items: center;
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
