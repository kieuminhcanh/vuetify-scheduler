<template>
  <v-layout>
    <v-app-bar title="Vuetify Notifier">
      <v-btn icon="mdi-github" variant="text" href="https://github.com/kieuminhcanh/vuetify-notifier" target="_blank">
        <v-tooltip activator="parent" location="bottom">Github</v-tooltip></v-btn>
      <v-btn icon="mdi-code-tags" variant="text"
        href="https://github.com/kieuminhcanh/vuetify-notifier/blob/master/src/App.vue" target="_blank">
        <v-tooltip activator="parent" location="bottom">Source Code</v-tooltip></v-btn>


      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" href="https://github.com/kieuminhcanh/vuetify-notifier" target="_blank">
            <v-icon>
              mdi-github
            </v-icon>
          </v-btn>
        </template>
        <span>Github</span>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" href="https://github.com/kieuminhcanh/vuetify-notifier/blob/master/src/App.vue"
            target="_blank">
            <v-icon>
              mdi-code-tags
            </v-icon>
          </v-btn>
        </template>
        <span>Source Code</span>
      </v-tooltip>

    </v-app-bar>
    <v-main>
      <VCard class="overflow-hidden">
        <VScheduler v-bind="schedulerConfig" />
      </VCard>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">

import { ref } from "vue";
import VScheduler from "../src/components/VScheduler.vue";
import { reactive } from "vue";
import { VCard } from "vuetify/components";
import { SchedulerProps } from "../src/types";

const schedulerConfig = reactive<SchedulerProps>({
  dates: {
    from: '2017-01-01 06:00',
    to: '2017-01-01 21:00',
  },
  resources: [
    { id: 'r1', name: 'Mike' },
    { id: 'r2', name: 'Linda' },
    { id: 'r3', name: 'Don' },
    { id: 'r4', name: 'Karen' },
    { id: 'r5', name: 'Doug' },
    { id: 'r6', name: 'Peter' },
    { id: 'r7', name: 'Sam' },
    { id: 'r8', name: 'Melissa' },
    { id: 'r9', name: 'John' },
    { id: 'r10', name: 'Ellen' }
  ],
  events: [
    {
      resourceId: 'r1',
      start: '2017-01-01 10:00',
      end: '2017-01-01 14:00',
      text: 'Click me',
    },
    {
      resourceId: 'r2',
      start: new Date(2017, 0, 1, 12),
      end: new Date(2017, 0, 1, 13, 30),
      text: 'Drag me ',
    },
    {
      resourceId: 'r1',
      start: '2017-01-01 10:00',
      end: '2017-01-01 12:00',
      text: 'Double click me',
      color: 'purple',
    },
    {
      resourceId: 'r4',
      start: new Date(2017, 0, 1, 8, 12),
      end: new Date(2017, 0, 1, 11),
      text: 'Right click me',
    },
    {
      resourceId: 'r5',
      start: new Date(2017, 0, 1, 15),
      end: new Date(2017, 0, 1, 17),
      text: 'Resize me',
    },
    {
      resourceId: 'r6',
      start: new Date(2017, 0, 1, 16),
      end: new Date(2017, 0, 1, 19),
      text: 'Important meeting',
      color: 'red'
    },
    {
      resourceId: 'r6',
      start: new Date(2017, 0, 1, 6),
      end: new Date(2017, 0, 1, 8),
      text: 'Sports event',
    },
    {
      resourceId: 'r7',
      start: new Date(2017, 0, 1, 9),
      end: new Date(2017, 0, 1, 11, 30),
      text: "Dad's birthday!",
    }
  ],
  options: {
    intervals: 30,
  }
})

</script>


