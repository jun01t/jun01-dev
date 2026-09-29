<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSaved } from '../composables/useSaved'

const route = useRoute()
const { count } = useSaved()
</script>

<template>
  <header class="site-header">
    <div class="shell header-inner">
      <RouterLink class="brand" to="/">
        <strong>机上</strong>
        <span>jun01 desk</span>
      </RouterLink>
      <nav class="nav" aria-label="主要">
        <RouterLink to="/">今週</RouterLink>
        <RouterLink v-slot="{ href, navigate }" to="/archive" custom>
          <a
            :href="href"
            :class="{ 'router-link-active': route.path === '/archive' && route.query.saved !== '1' }"
            :aria-current="route.path === '/archive' && route.query.saved !== '1' ? 'page' : undefined"
            @click="navigate"
          >アーカイブ</a>
        </RouterLink>
        <RouterLink to="/lens">視点</RouterLink>
        <RouterLink v-slot="{ href, navigate }" to="/archive?saved=1" custom>
          <a
            :href="href"
            :class="{ 'router-link-active': route.query.saved === '1' }"
            :aria-current="route.query.saved === '1' ? 'page' : undefined"
            @click="navigate"
          >保存<span v-if="count" class="count">{{ count }}</span></a>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
