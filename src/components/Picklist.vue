<script setup>
import { ref, watch } from 'vue'

// v-model controls whether the dialog is open.
const open = defineModel({ type: Boolean, default: false })

// Emitted with the checked codes when the user presses Add selections.
const emit = defineEmits(['add'])

const options = ref([])
const picked = ref([])

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'

function randomChars(chars, count) {
  return Array.from({ length: count }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// A random code like AB-123-CDE: 2 letters, 3 digits, 3 letters.
function randomCode() {
  return `${randomChars(LETTERS, 2)}-${randomChars(DIGITS, 3)}-${randomChars(LETTERS, 3)}`
}

// Fresh random options each time the dialog opens; a Set avoids duplicates.
watch(open, (isOpen) => {
  if (!isOpen) return
  const codes = new Set()
  while (codes.size < 10) codes.add(randomCode())
  options.value = [...codes]
  picked.value = []
})

function addSelections() {
  emit('add', [...picked.value])
  open.value = false
}
</script>

<template>
  <v-dialog v-model="open" max-width="400">
    <v-card title="Picklist">
      <!--
        Each checkbox shares the picked array: checking one adds its code,
        unchecking removes it.
      -->
      <v-card-text class="py-0">
        <v-checkbox
          v-for="code in options"
          :key="code"
          v-model="picked"
          :value="code"
          :label="code"
          class="font-monospace"
          density="compact"
          hide-details
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="open = false">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!picked.length"
          @click="addSelections"
        >
          Add selections
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
