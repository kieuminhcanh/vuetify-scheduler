

<script setup lang="ts">
import VueDraggify from "../../../vue-draggify/src/components/DraggifyEager.vue";
import dayjs, { Dayjs } from 'dayjs';
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import { PropType, computed, onMounted, reactive, ref } from 'vue';
import { SchedulerOptions, SchedulerEvent, SchedulerResource, SchedulerDate, SchedulerEventsOptions, SchedulerResourcesOptions } from "../types";
import { VCard, VCardText, VSheet, VToolbar, VTable, VListItem, VCol, VList, VRow, VAppBar, VContainer, VDivider, VHover, VListItemTitle, VListItemSubtitle, VBtn, VSnackbar } from "vuetify/components";
import { vScroll } from '@vueuse/components'

import { MouseDownResizer } from "../utils";
import { UseScrollReturn, clamp, useDebounceFn, useEventListener } from '@vueuse/core';
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

const options = reactive<SchedulerOptions>(deepMerge(defaultOptions, props.options) as SchedulerOptions)

const pixelPerMinute = computed(() => {
  return (options?.events?.width as number) / 60
})

const axisStart = reactive({
  x: 0,
  y: 0,
})

const temp = reactive({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})

const eventsSorted = computed(() => {
  let lastY = 0
  const test = props.resources.map((resource, resourceIndex) => {

    const eventItems = events.value.filter(event => event.resourceId === resource.id)
      .sort((a, b) => {
        return a.start.isBefore(b.start) ? -1 : 1
      })
      .map((eventMap, eventIndex, array) => {
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


  console.log(test);
  return test as SchedulerResource[]
})
// const eventsSorted = computed(() => {
//   const aaa = events.value
//     .sort((a, b) => {
//       return a.start.isBefore(b.start) ? 1 : -1
//     }).sort((a, b) => {
//       return a.resourceId > b.resourceId ? 1 : -1
//     })
//     .map((eventMap, eventIndex) => {
//       eventMap.x = eventMap.x ?? Math.round((eventMap.start.diff(dates.value.from, 'minute')) * pixelPerMinute.value)
//       return eventMap
//     }).reduce((eventsReduce: SchedulerEvent[], event, eventIndex) => {


//       const prev = eventsReduce[eventIndex - 1]

//       if (!prev) {
//         event.y = 0
//       } else {
//         if (event.resourceId === prev.resourceId) {
//           if (event.start.isBetween(prev.start, prev.end, 'minute', "[)")) {
//             event.y = prev.y as number + options.rowHeight
//           } else {
//             event.y = prev.y
//           }
//         } else {
//           event.y = prev.y + options.rowHeight
//         }


//       }
//       return [
//         ...eventsReduce,
//         event
//       ]
//     }, [])
// })

const onEventStart = (eventStart: MouseEvent, item: any) => {
  console.log('Event Start');
  const target = eventStart.target as HTMLElement
  const element = target.closest('.scheduler-events-item') as HTMLElement


  axisStart.x = eventStart.clientX
  axisStart.y = eventStart.clientY



  temp.x = item.x
  temp.y = item.y
  temp.width = item.width
  temp.height = item.height
  console.log(temp);

  const removeEventMove = useEventListener(document, 'mousemove', (eventMove: MouseEvent) => {


    const axisMove = {
      x: eventMove.clientX - axisStart.x,
      y: eventMove.clientY - axisStart.y
    }

    const axisNew = {
      x: temp.x + axisMove.x,
      y: temp.y + axisMove.y
    }

    // timerStyle.value.start = dates.value.from.add(axisNew.x / pixelPerMinute.value, 'minute')
    // timerStyle.value.end = dates.value.from.add((axisNew.x + item.width) / pixelPerMinute.value, 'minute')
    console.log(element.clientLeft);

    if (target && element) {
      console.log(eventMove.clientX);
      element.classList.add('scheduler-events-item--moving')
      element.style.position = 'fixed'
      element.style.left = eventMove.clientX - (options.events.width / 2) + 'px'
      element.style.top = eventMove.clientY - (options.events.height / 2) + 'px'
      element.style.zIndex = '1000'
    }


    const event = events.value.find(event => event.id.toString() === item.id?.toString())
    if (event) {

      // event.resourceId = event.resourceId

      // event.x = axisNew.x
      // event.y = axisNew.y
      // event.width = item.width
      // event.height = item.height
      // event.start = dates.value.from.add(axisNew.x / pixelPerMinute.value, 'minute')
      // event.end = dates.value.from.add((axisNew.x + item.width) / pixelPerMinute.value, 'minute')
    }
  })
  const removeEventEnd = useEventListener(document, 'mouseup', (e: MouseEvent) => {
    const axisEnd = {
      x: e.clientX - axisStart.x,
      y: e.clientY - axisStart.y
    }
    let axisNew = {
      x: temp.x + axisEnd.x,
      y: temp.y + axisEnd.y
    }
    removeEventMove()
    removeEventEnd()
  })
}

const onDrop = (e: DragEvent, resource: any) => {

  const eventId = e.dataTransfer?.getData("eventId")

  const event = events.value.find(event => event.id.toString() === eventId?.toString())
  if (event) {
    const axisEnd = {
      x: e.clientX - axisStart.x,
      y: e.clientY - axisStart.y
    }

    let axisNew = {
      x: temp.x + axisEnd.x,
      y: temp.y + axisEnd.y
    }

    event.resourceId = resource.id
    event.x = axisNew.x
    event.start = dates.value.from.add(axisNew.x / pixelPerMinute.value, 'minute')
    event.end = dates.value.from.add((axisNew.x + temp.width) / pixelPerMinute.value, 'minute')

  }
}

const { style: timeRangesStyle } = reactiveStyle({
  backgroundSize: `${options.events?.width}px`,
  backgroundImage: 'linear-gradient(to right, #c9c9c9 1px, transparent 1px)'
})

const { style: gridStyle } = reactiveStyle({
  backgroundSize: `100% ${options?.rowHeight}px`,
  'background-image': 'linear-gradient(to bottom, #000000 0px, transparent 0.5px)',
})

const { style: itemStyle } = reactiveStyle({
  width: `${options.events?.width}px`,
  height: `${options?.rowHeight}px`,

  'cursor': 'move'
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

const getHeight = (resource: SchedulerResource) => {

  return resource.events.reduce((count: number, current: SchedulerEvent, index: number, array: SchedulerEvent[]) => {

    const prev = array[index - 1];
    if (prev && current.start.isBetween(prev.start, prev.end, "minute", "[)")) {
      count++;
    }
    return count;
  }, 1)
}
const draggable = ref(true)

const onResizeStart = (e: MouseEvent, item: any, direction: "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-left" | "bottom-right") => {
  draggable.value = false

  const resizer = e.target as HTMLDivElement
  resizer.style.cursor = 'col-resize'
  document.body.style.cursor = 'col-resize'



  axisStart.x = e.clientX
  axisStart.y = e.clientY

  temp.x = item.x
  temp.y = item.y
  temp.width = item.width
  temp.height = item.height

  let data = { ...temp }

  const removeResizeMove = useEventListener(document, 'mousemove', (e: MouseEvent) => {
    const moveAxis = {
      x: e.clientX - axisStart.x,
      y: e.clientY - axisStart.y
    }

    const axisNew = {
      x: temp.x + moveAxis.x,
      y: temp.y + moveAxis.y,
      width: temp.width + moveAxis.x,
      height: temp.height + moveAxis.y
    }


    // if (options.grid.stickToGrid) {
    //   axisNew.x = Math.round(axisNew.x / options.grid.x) * options.grid.x;
    //   axisNew.y = Math.round(axisNew.y / options.grid.y) * options.grid.y;
    //   axisNew.width = Math.round(axisNew.width / options.grid.x) * options.grid.x;
    //   axisNew.height = Math.round(axisNew.height / options.grid.y) * options.grid.y;
    // }
    // console.log(axisNew);


    switch (direction) {
      case "top":
        data.x = temp.x
        data.y = clamp(axisNew.y, 0, temp.y + temp.height - options.resize.minHeight)
        data.width = temp.width
        data.height = temp.height - (data.y - temp.y)
        break;
      case "right":
        data.x = temp.x
        data.y = temp.y
        data.width = clamp(axisNew.width, options.resize.minWidth, eventsContainerSize.value.width - temp.x)
        data.height = temp.height
        break;
      case "bottom":
        data.x = temp.x
        data.y = temp.y
        data.width = temp.width
        data.height = clamp(axisNew.height, options.resize.minHeight, eventsContainerSize.value.height - temp.y)
        break;
      case "left":
        data.x = clamp(axisNew.x, 0, temp.x + temp.width - options.resize.minWidth)
        data.y = temp.y
        data.width = temp.width - (data.x - temp.x)
        data.height = temp.height
        break;
      case "top-left":
        data.x = clamp(axisNew.x, 0, temp.x + temp.width - options.resize.minWidth)
        data.y = clamp(axisNew.y, 0, temp.y + temp.height - options.resize.minHeight)
        data.width = temp.width - (data.x - temp.x)
        data.height = temp.height - (data.y - temp.y)
        break;
      case "top-right":
        data.x = temp.x
        data.y = clamp(axisNew.y, 0, temp.y + temp.height - options.resize.minHeight)
        data.width = clamp(axisNew.width, options.resize.minWidth, eventsContainerSize.value.width - temp.x)
        data.height = temp.height - (data.y - temp.y)
        break;
      case "bottom-left":
        data.x = clamp(axisNew.x, 0, temp.x + temp.width - options.resize.minWidth)
        data.y = temp.y
        data.width = temp.width - (data.x - temp.x)
        data.height = clamp(axisNew.height, options.resize.minHeight, eventsContainerSize.value.height - temp.y)
        break;
      case "bottom-right":
        data.x = temp.x
        data.y = temp.y
        data.width = clamp(axisNew.width, options.resize.minWidth, eventsContainerSize.value.width - temp.x)
        data.height = clamp(axisNew.height, options.resize.minHeight, eventsContainerSize.value.height - temp.y)
        break;
      default:
        break;
    }

    const event = events.value.find(event => event.id.toString() === item.id?.toString())
    if (event) {
      const axisEnd = {
        x: e.clientX - axisStart.x,
        y: e.clientY - axisStart.y
      }

      let axisNew = {
        x: temp.x + axisEnd.x,
        y: temp.y + axisEnd.y
      }

      event.resourceId = event.resourceId
      console.log(data);

      event.x = data.x
      event.y = data.y
      event.width = data.width
      event.height = data.height
      event.start = dates.value.from.add(data.x / pixelPerMinute.value, 'minute')
      event.end = dates.value.from.add((data.x + data.width) / pixelPerMinute.value, 'minute')
    }
  });



  const removeResizeEnd = useEventListener(document, 'mouseup', (e: MouseEvent) => {
    resizer.style.removeProperty('cursor')
    document.body.style.removeProperty('cursor')
    draggable.value = true
    removeResizeMove()
    removeResizeEnd()
  });

}
const getEventStyle = (event: SchedulerEvent) => {
  return {
    top: `${event.y}px`,
    left: `${event.x}px`,
    width: `${event.width}px`,
    height: `${event.height - options.events.margin}px`,
    'margin-top': `${options.events.margin / 2}px `,
  }
}

const timeHelper = ref({
  x: 0,
  y: 0
})

const onDrag = (e: DragEvent) => {

  const axisMove = {
    x: e.clientX - axisStart.x,
    y: e.clientY - axisStart.y
  }

  let axisNew = {
    x: temp.x + axisMove.x,
    y: temp.y + axisMove.y
  }

  timeHelper.value = { ...axisNew }

}

const timerStyle = ref({
  start: dayjs(),
  end: dayjs(),
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
          :style="timeRangesStyle">
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
        <!-- Resources list -->
        <VSheet :width="options?.resources?.width" :style="gridStyle" class="scheluder-resources-container">
          <VSheet v-for="(resource, index) in eventsSorted" :key="resource.id"
            class="scheduler-rows scheduler-resources-rows" :height="options.rowHeight * getHeight(resource)">
            <VListItem :title="`${resource.id}: ${resource.name}`" lines="two" density="compact" />
          </VSheet>
        </VSheet>
      </VCol>
      <VCol cols="auto">
        <!-- Resizer -->
        <VSheet width="6" height="100%" color="rgba(0, 0, 0, 0.5)" class="scheduler-resizer h-100"
          @mousedown="onResourcesResize">|
        </VSheet>
      </VCol>
      <!-- Events Container -->
      <VCol class="overflow-x-auto overflow-y-hidden" v-scroll="onScrollText">

        <!-- <VBtn absolute offse>Hello</VBtn> -->
        <VSheet :width="eventsContainerSize.width" :height="eventsContainerSize.height" class="scheluder-events-container"
          :style="gridStyle">
          <template v-for="( resource, eventIndex ) in eventsSorted">
            <template v-for="( event, eventIndex ) in  resource.events" :key="event.id">
              <!-- Event Item -->
              <VSheet @mousedown="onEventStart($event, event)" :width="event.width" class="scheduler-events-item"
                :height="event.height" color="blue" :style="getEventStyle(event)">
                <div class="scheduler-events-item-time">{{ timerStyle.start.format("HH:mm") }} - {{
                  timerStyle.end.format("HH:mm") }}</div>
                <!-- Resizer left -->
                <!-- <div
                style="z-index: 1;position: absolute;top: 0;left: 0;bottom: 0;height: 100%;width: 5px;cursor: e-resize;background-color: red;border-top-left-radius: 5px;border-bottom-left-radius: 5px;"
                @mousedown.stop="onResizeStart($event, event, 'left')">
              </div> -->
                <!-- Resizer right -->
                <!-- <div
                style="z-index: 1;position: absolute;top: 0;right: 0;bottom: 0;height: 100%;width: 5px;cursor: e-resize;background-color: red;border-top-right-radius: 5px;border-bottom-right-radius: 5px;"
                @mousedown.stop="onResizeStart($event, event, 'right')">
              </div> -->

                <!-- Event content -->
                <VListItem nav lines="two">
                  <VListItemTitle>{{ event.id }} - {{ event.resourceId }} - {{ event.text }}</VListItemTitle>
                  <VListItemSubtitle>{{ `${event.start.format('HH:mm')} -${event.end.format('HH:mm')} ` }}
                  </VListItemSubtitle>
                </VListItem>
              </VSheet>
            </template>
          </template>
          <TransitionGroup>
            <!-- Event Rows -->
            <template v-for="( resource, resourceIndex ) in  eventsSorted " :key="resource.id">
              <!-- Event Row -->
              <VSheet :width="eventsContainerSize.width" :height="options.rowHeight * getHeight(resource)"
                class="scheduler-rows scheduler-events-rows" @drop="onDrop($event, resource)" @dragenter.prevent
                @dragover.prevent>
              </VSheet>
              <!-- Event Items -->
            </template>
          </TransitionGroup>

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

.scheduler-rows {
  border-bottom: 1px solid #dddddd;
  transition: height 0.5s ease;
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

    .scheduler-events-item-time {
      visibility: hidden;
      position: absolute;
      top: -40px;
      height: 30px;
      width: 100%;
      background-color: red;
    }

    &.scheduler-events-item--moving {
      .scheduler-events-item-time {
        visibility: visible;
      }
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
