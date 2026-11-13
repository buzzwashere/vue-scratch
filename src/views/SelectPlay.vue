<script setup>
import { ref } from 'vue'

const items = [
  { title: 'Item one', description: 'This is item one' },
  { title: 'Item two', description: 'This is item two' },
]

// Holds the selected item's title (item-value), not the whole object.
const selected = ref(null)

// Extra props/attrs for each option's v-list-item; attrs like aria-label
// fall through to the option element (role="option").
function itemProps(item) {
  return {
    'aria-label': `${item.title}: ${item.description}`,
  }
}

// Holds the combobox's title value (or free text the user typed).
const comboSelected = ref(null)

// Each combobox row: description as the title line, title underneath as subtitle.
function comboItemProps(item) {
  return {
    subtitle: item.title,
  }
}
</script>

<template>
  <h1 class="text-h5 mb-4">Select play</h1>

  <!-- Options are labelled by description; v-model receives the title. -->
  <v-select
    v-model="selected"
    :items="items"
    item-title="description"
    item-value="title"
    :item-props="itemProps"
    label="Pick an item"
    max-width="400"
    clearable
  >
    <!-- Show the title in the field once selected; item.raw is the original object. -->
    <template #selection="{ item }">
      {{ item.raw.title }}
    </template>
  </v-select>

  <p v-if="selected" class="text-body-1">
    Selected: <strong>{{ selected }}</strong>
  </p>

  <h2 class="text-h6 mt-8 mb-4">Combobox</h2>

  <!--
    Rows show description with the title underneath. return-object is off
    (it defaults to true on v-combobox), so v-model receives the title.
  -->
  <v-combobox
    v-model="comboSelected"
    :items="items"
    item-title="description"
    item-value="title"
    :item-props="comboItemProps"
    :return-object="false"
    label="Pick or type an item"
    max-width="400"
    clearable
  />

  <p v-if="comboSelected" class="text-body-1">
    Combobox value: <strong>{{ comboSelected }}</strong>
  </p>
</template>
