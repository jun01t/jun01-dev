import { createApp } from 'vue'
import App from './App.vue'
import { loadDigest } from './data/catalog'
import { router } from './router'
import './style.css'

await loadDigest()
createApp(App).use(router).mount('#app')
