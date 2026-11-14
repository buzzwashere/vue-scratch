<script setup>
import { ref } from 'vue'
import ComboDemoPanel from '../components/ComboDemoPanel.vue'

// Selected tab. Vuetify's v-tabs/v-tab give role="tablist"/"tab" and
// Left/Right arrow keys between tabs; Tab moves into the active panel.
const tab = ref('option-1')
</script>

<template>
  <h1 class="text-h5 mb-4">Combobox chips</h1>

  <div class="demo-tabs">
    <v-tabs v-model="tab" color="primary" aria-label="Options">
      <v-tab value="option-1">Button on Left</v-tab>
      <v-tab value="option-2">Button on Top</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab" class="pt-4">
      <!-- Button on Left: Picklist button to the left of the field. -->
      <v-tabs-window-item value="option-1">
        <ComboDemoPanel />
      </v-tabs-window-item>

      <!-- Button on Top: same, with the button above the field at full width. -->
      <v-tabs-window-item value="option-2">
        <ComboDemoPanel button-position="top" />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<style scoped>
/* No max width: the code column uses whatever room the window has. */
.demo-tabs {
  max-width: none;
}
</style>
