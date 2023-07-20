import { App } from 'vue';
import VuetifyScheduler from "./components/VScheduler.vue";
import VueDraggify from "vue-draggify";

export default {
  install: (app: App, options?: any) => {
    app.component("VScheduler", VuetifyScheduler);
  },
};

export { VuetifyScheduler };

