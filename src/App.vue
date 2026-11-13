<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>Vue Scratch</v-app-bar-title>
      <v-btn to="/" prepend-icon="mdi-home">Home</v-btn>
      <v-btn to="/about" prepend-icon="mdi-information">About</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
