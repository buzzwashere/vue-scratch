<script setup>
import { RouterView, useRoute } from 'vue-router'

// Routes with meta.wide get a full-width container with slim side padding.
const route = useRoute()
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>Vue Scratch</v-app-bar-title>
      <v-btn to="/" prepend-icon="mdi-home">Home</v-btn>
      <v-btn to="/about" prepend-icon="mdi-information">About</v-btn>
    </v-app-bar>

    <v-main>
      <v-container :fluid="!!route.meta.wide" :class="{ 'px-5': route.meta.wide }">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
