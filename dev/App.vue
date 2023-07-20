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

const schedulerConfig = reactive({
  dates: {
    from: '2023-04-14 06:00',
    to: '2023-04-14 21:00',
  },
  resources: [
    {
      "id": "98ee62dd-2b02-4da9-88dd-b452a7b33e36",
      "name": "Ava O'Reilly V"
    },
    {
      "id": "98ee62dd-ac30-4624-a433-08a15da3447a",
      "name": "Hanna Lakin"
    },
    {
      "id": "98ee62dd-c9ab-4ff2-a66b-41bdab066a9b",
      "name": "Leonor Strosin II"
    },
    {
      "id": "98ee62dd-f276-4908-81b9-c84d83b6eb4f",
      "name": "Lavern Pollich PhD"
    },
    {
      "id": "98ee62de-1726-41dd-a88a-64236306b86a",
      "name": "Mrs. Chyna Fadel III"
    },
    {
      "id": "98ee62de-3cfe-47ce-9918-f7674b6ead54",
      "name": "Mrs. Odie Aufderhar V"
    },
    {
      "id": "98ee62de-5b4c-4748-9031-d7eef135bc26",
      "name": "Dr. Octavia Dooley DVM"
    },
    {
      "id": "98ee62de-7537-4bb9-8e97-ac5668e65ad2",
      "name": "Parker Carroll"
    },
    {
      "id": "98ee62de-8fef-42fe-bc2c-0e3a008f1e7f",
      "name": "Karlie Wunsch"
    },
    {
      "id": "98ee62de-ae77-4f9c-bebc-7fd81e056346",
      "name": "Greta Mayert"
    }
  ],
  events: [
    {
      "id": "98ee62e6-224e-4e41-bfc1-d14b29e7901e",
      "no": "1",
      "status": "pending",
      "start": "2023-04-14 11:18:08",
      "end": "2023-04-14 11:34:08",
      "duration": 16,
      "resourceId": "98ee62de-7537-4bb9-8e97-ac5668e65ad2"
    },
    {
      "id": "98ee62e6-a73c-4324-a75e-6470a9e96d6b",
      "no": "9",
      "status": "pending",
      "start": "2023-04-14 11:18:09",
      "end": "2023-04-14 11:35:09",
      "duration": 17,
      "resourceId": "98ee62de-1726-41dd-a88a-64236306b86a"
    },
    {
      "id": "98ee62e7-9c31-45ae-83a5-a8b25591f125",
      "no": "25",
      "status": "pending",
      "start": "2023-04-14 11:18:09",
      "end": "2023-04-14 11:35:09",
      "duration": 17,
      "resourceId": "98ee62de-7537-4bb9-8e97-ac5668e65ad2"
    },
    {
      "id": "98ee62e7-d66a-4d4d-b200-b8aa114bb262",
      "no": "29",
      "status": "pending",
      "start": "2023-04-14 11:18:09",
      "end": "2023-04-14 11:40:09",
      "duration": 22,
      "resourceId": "98ee62de-3cfe-47ce-9918-f7674b6ead54"
    },
    {
      "id": "98ee62e8-bfb2-4e38-aa20-7e136885c5d0",
      "no": "45",
      "status": "pending",
      "start": "2023-04-14 11:18:10",
      "end": "2023-04-14 11:35:10",
      "duration": 17,
      "resourceId": "98ee62de-3cfe-47ce-9918-f7674b6ead54"
    },
    {
      "id": "98ee62e8-f83d-4423-bd7b-950a93bb37d7",
      "no": "49",
      "status": "pending",
      "start": "2023-04-14 11:18:10",
      "end": "2023-04-14 11:44:10",
      "duration": 26,
      "resourceId": "98ee62dd-2b02-4da9-88dd-b452a7b33e36"
    },
    {
      "id": "98ee62ea-56df-45d2-9fb8-22c496513aea",
      "no": "73",
      "status": "pending",
      "start": "2023-04-14 11:18:11",
      "end": "2023-04-14 11:37:11",
      "duration": 19,
      "resourceId": "98ee62de-ae77-4f9c-bebc-7fd81e056346"
    },
    {
      "id": "98ee62ea-ce62-4ea2-a6fc-c8ef846d04c7",
      "no": "81",
      "status": "pending",
      "start": "2023-04-14 11:18:11",
      "end": "2023-04-14 11:23:11",
      "duration": 5,
      "resourceId": "98ee62de-1726-41dd-a88a-64236306b86a"
    },
    {
      "id": "98ee62eb-b8ea-4ce0-8b7b-bf70403fbc75",
      "no": "97",
      "status": "pending",
      "start": "2023-04-14 11:18:12",
      "end": "2023-04-14 11:35:12",
      "duration": 17,
      "resourceId": "98ee62dd-ac30-4624-a433-08a15da3447a"
    }
  ],
  options: {
    intervals: 30,
  }
})

</script>


