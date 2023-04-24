<template>
  <VCard>
    <VToolbar>

      <v-spacer />
      {{ dayjs(startDate).format('YYYY-MM-DD') }}
      <v-spacer />

    </VToolbar>
    <VTable fixed-header :height="height" class="scheduler" ref="tableRef">
      <thead>
        <tr>
          <th ref="resourceHeadRef" class="pa-0">
            <VSheet :width="resourcesStyles.width" color="red" ref="resourcesHeaderRef"> Name</VSheet>
            <VSheet class="resizer" :height="tableHeight" @mousedown="onMouseDownResourcesColumn" ref="resizerRef">
            </VSheet>
          </th>
          <template v-for="(item) in dateTimeRanges">
            <th>
              <VBtn :width="eventsStyles.width" block variant="text">{{ item.format("hh A") }}</VBtn>
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <template v-for="(resource) in resources">
          <tr>
            <th class="text-none-wrap" ref="resourcesRefs">
              <VListItem @click="" :title="resource.name" />
            </th>
            <td class="scheduler-item">
              <template v-for="(event) in _events">
                <UseDraggable :initialValue="{
                  x: event.startPoint,
                  y: event.endPoint - event.startPoint
                }" :axis="'x'">

                  <v-sheet class="scheduler-event elevation-5 d-flex align-center justify-space-between" height="80%"
                    :color="event.color || 'white'" v-if="checkEventValid(resource, event)" :style="getEventStyles(event)"
                    ref="eventRefs">
                    <VSheet color="primary" width="5" height="100%"
                      class="scheduler-event-resize flex-shrink-1 d-flex align-center justify-center"
                      @mousedown="($event: any) => onMouseDownEventResize($event, event)">|
                    </VSheet>
                    <v-tooltip activator="parent" location="top">{{ dayjs(event.startDate).format('HH:mm')
                    }} - {{ dayjs(event.endDate).format('HH:mm')
}}</v-tooltip>
                    <div class="flex-grow-1 pl-3">
                      <div>
                        {{ event.text }}
                      </div>
                    </div>
                    <VSheet color="primary" width="5" height="100%"
                      class="scheduler-event-resize flex-shrink-1 d-flex align-center justify-center"
                      @mousedown="($event: any) => onMouseDownEventResize($event, event, true)">|
                    </VSheet>
                  </v-sheet>
                </UseDraggable>
              </template>
            </td>
            <template v-for="(time, index) in dateTimeRanges.length">
              <td class="scheduler-item">
                <!-- <template v-for="(event) in getEvents">
                  <v-sheet class="scheduler-event elevation-5 d-flex align-center justify-space-between" height="80%"
                    :color="event.color || 'white'"
                    v-if="checkEventValid(resource, event, time, dateTimeRanges[index + 1])"
                    :style="getEventStyles(event, time)">
                    <VSheet color="primary" width="5" height="100%"
                      class="scheduler-event-resize flex-shrink-1 d-flex align-center justify-center"
                      @mousedown="($event: any) => onMouseDownEventResize($event, event)">|
                    </VSheet>
                    <v-tooltip activator="parent" location="top">{{ dayjs(event.startDate).format('HH:mm')
                    }} - {{ dayjs(event.endDate).format('HH:mm')
}}</v-tooltip>
                    <div class="flex-grow-1 pl-3">
                      <div>
                        {{ event.text }}
                      </div>
                    </div>
                    <VSheet color="primary" width="5" height="100%"
                      class="scheduler-event-resize flex-shrink-1 d-flex align-center justify-center"
                      @mousedown="($event: any) => onMouseDownEventResize($event, event, true)">|
                    </VSheet>
                  </v-sheet>
                </template> -->
              </td>
            </template>
          </tr>
        </template>
      </tbody>
    </VTable>
  </VCard>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import type { Dayjs } from "dayjs";
import { useElementSize } from '@vueuse/core'
import { UseDraggable } from "@vueuse/components";



import { computed, onMounted, ref } from 'vue';
import type { PropType } from "vue";
import { SchedulerEvent, SchedulerEventsOptions, SchedulerResource, SchedulerResourcesOptions, SchedulerOptions } from "../types";
import { processExpression } from "@vue/compiler-core";

const resourcesRefs = ref<HTMLElement[]>([]);
const resourcesHeaderRef = ref<HTMLElement>();
// const eventRefs = ref<HTMLElement[]>([]);
// eventRefs.value.forEach((el) => {
//   const { x, y, style } = useDraggable(el, {
//     initialValue: { x: 40, y: 40 },
//   })
// })



dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)

const props = defineProps({
  intervals: {
    type: Number,
    default: 30
  },
  height: {
    type: [Number, String],
    default: '100%'
  },
  loading: {
    type: Boolean,
    default: false
  },

  startDate: {
    type: Date,
    default: () => {
      return new Date()
    }
  },
  endDate: {
    type: Date,
    default: () => {
      return new Date()
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
  default: {
    type: Object as PropType<SchedulerOptions>,
    default: () => ({
      rowHeight: 56
    })
  },
  resourcesConfig: {
    type: Object as PropType<SchedulerResourcesOptions>,
    default: () => ({
      width: 100
    })
  },
  eventsConfig: {
    type: Object as PropType<SchedulerEventsOptions>,
    default: () => ({
      width: 180
    })
  }

})


const _events = ref<SchedulerEvent[]>(props.events.map((event) => {
  const startDate = dayjs(event.startDate)
  const endDate = dayjs(event.endDate)
  return {
    ...event,
    startDate,
    endDate,
    startPoint: Math.round(startDate.diff(props.startDate, 'minute') * props.eventsConfig.width / 60),
    endPoint: Math.round(endDate.diff(props.startDate, 'minute') * props.eventsConfig.width / 60),
    topPoint: props.resources.findIndex((resource) => resource.id === event.resourceId) * props.default.rowHeight
  }
}))

const checkEventValid = (resource: SchedulerResource, event: SchedulerEvent) => {
  if (resource.id !== event.resourceId) {
    return false
  }
  return true
  // const start = dayjs(event.startDate)

  // return start.isBetween(time, nextTime, 'minute', '[)') //isSameOrAfter(time) && start.isBefore(nextTime)
}

const getEventStyles = (event: SchedulerEvent) => {
  const marginTop = Math.round(10 * props.default.rowHeight / 100)
  return {
    x: `${event.startPoint}px`,
    // width: `${event.endPoint - event.startPoint}px`,
    y: `10%`,
  }
}

const resourcesStyles = ref<SchedulerResourcesOptions>(props.resourcesConfig)
const eventsStyles = ref<SchedulerEventsOptions>(props.eventsConfig)


const onMouseDownResourcesColumn = (e: MouseEvent) => {
  let _x = e.clientX;
  let _width = resourcesStyles.value.width;

  const onMouseMoveHandler = (event: MouseEvent) => {
    const dx = event.clientX - _x;
    resourcesStyles.value.width = _width + dx;
  };

  const onMouseUpHandler = (event: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMoveHandler);
    document.removeEventListener('mouseup', onMouseUpHandler);
  };

  document.addEventListener('mousemove', onMouseMoveHandler);
  document.addEventListener('mouseup', onMouseUpHandler);
};

const onMouseDownEventResize = (e: MouseEvent, event: SchedulerEvent, isEnd = false) => {

  let _x = e.clientX;


  let _point = !isEnd ? event.startPoint : event.endPoint
  let _date = !isEnd ? event.startDate : event.endDate

  const onMouseMoveHandler = (e: MouseEvent) => {

    const dx = e.clientX - _x;
    const minute = Math.round(dx * 60 / props.eventsConfig.width)

    !isEnd ? event.startPoint += dx : event.endPoint += dx

    if (!isEnd) {
      event.startPoint = _point + dx
      if (minute % 15 === 0) {
        event.startDate = _date.add(minute, 'minute')
      }
    }
    else {
      event.endPoint = _point + dx
      if (minute % props.intervals === 0) {
        event.startDate = _date.add(minute, 'minute')
      }
    }

  };

  const onMouseUpHandler = (e: MouseEvent) => {
    event.startPoint = Math.round(event.startDate.diff(props.startDate, 'minute') * props.eventsConfig.width / 60)
    event.endPoint = Math.round(event.endDate.diff(props.startDate, 'minute') * props.eventsConfig.width / 60)

    document.removeEventListener('mousemove', onMouseMoveHandler);
    document.removeEventListener('mouseup', onMouseUpHandler);
  };

  document.addEventListener('mousemove', onMouseMoveHandler);
  document.addEventListener('mouseup', onMouseUpHandler);
};



const tableRef = ref<HTMLTableElement>()
const resizerRef = ref<HTMLElement>()

const { height: tableHeight } = useElementSize(tableRef)

const dateTimeRanges = computed<Dayjs[]>(() => {
  let dateTimes: Dayjs[] = []
  let item = dayjs(props.startDate)
  do {
    dateTimes.push(item)
    item = item.add(1, 'hour')
  } while (item.isSameOrBefore(props.endDate))
  return dateTimes
})

</script>

<style lang="scss" scoped>
table tbody th {
  font-weight: bold;
  text-align: left;
  position: relative;
}

table th,

table td {
  padding: 0 !important;
  border-right: 1px solid #c3c3c3;
}

table thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 10 !important;
  border-right: 4px solid #c3c3c3;
}

table tbody th {
  position: sticky;
  left: 0;
  background: white;
  z-index: 3;
  border-right: 4px solid #c3c3c3;
}

.resizer {

  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  cursor: col-resize;
  user-select: none;
}

.resizer:hover,
.resizing {
  border-right: 4px solid blue;
  right: -4px;
  width: 8px;
}

.scheduler-event-resize {
  cursor: col-resize;
}

// .v-data-table {
//   thead>tr>th {
//     background-color: #009879 !important;
//     color: #ffffff !important;
//     text-align: center !important;
//     font-weight: bold;
//   }

//   th,
//   td {
//     border-right: 1px solid #f3f3f3;
//   }

//   td {
//     padding: 0 !important;
//   }

//   tbody>tr>td:first-child,
//   thead>tr>th:first-child {
//     padding: 0 16px !important;
//     position: sticky !important;
//     position: -webkit-sticky !important;
//     left: 0;
//     z-index: 2;
//     background-color: #009879 !important;
//     color: #ffffff !important;
//     text-align: left !important;
//     min-width: 250px;
//     display: flex;
//     align-items: center;
//   }

//   thead>tr>th:first-child {
//     z-index: 9999;
//   }
// }

.scheduler {
  .scheduler-item {
    position: relative;
  }

  .scheduler-event {
    position: absolute;
    z-index: 1;
    cursor: pointer;
    overflow: hidden;
  }
}
</style>
