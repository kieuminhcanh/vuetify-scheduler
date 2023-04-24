import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import App from './App.vue'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import './style.css'
import VueDraggify from '../../vue-draggify/src/index'

const vuetify = createVuetify({ components, directives, })

const app = createApp(App);

app.use(vuetify);
app.use(VueDraggify);
app.mount('#app');
