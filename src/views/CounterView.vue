<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <v-card max-width="400" class="mx-auto mt-8">
    <v-card-title>Vuetify + Pinia</v-card-title>
    <v-card-text>
      Count: {{ counter.count }} (doubled: {{ counter.doubleCount }})
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="counter.increment">
        Increment
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
