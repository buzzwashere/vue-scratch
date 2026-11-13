<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const pages = router.options.routes.filter((route) => route.meta?.title)
</script>

<template>
  <h1 class="text-h5 mb-4">Pages</h1>

  <v-list border rounded>
    <v-list-item
      v-for="page in pages"
      :key="page.name"
      :to="page.path"
      :title="page.meta.title"
      :subtitle="page.meta.description"
      append-icon="mdi-chevron-right"
    />
  </v-list>
</template>
