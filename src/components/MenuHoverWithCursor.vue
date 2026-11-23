<script setup>
import { ref, watch, mergeProps } from 'vue'

// A v-menu that opens on hover and is placed at the mouse cursor
// instead of next to the activator element.
//
// Usage:
//   <MenuHoverWithCursor :items="items" @select="onSelect">
//     <template #activator="{ props }">
//       <span v-bind="props">Hover me</span>
//     </template>
//   </MenuHoverWithCursor>
const props = defineProps({
  // Menu rows: { title, value? }. Ignored when the default slot is used.
  items: { type: Array, default: () => [] },
  // Where the menu sits relative to the cursor point.
  location: { type: String, default: 'bottom start' },
  // Gap in px between the cursor and the menu.
  offset: { type: [Number, String, Array], default: 8 },
  openDelay: { type: [Number, String], default: 300 },
  closeDelay: { type: [Number, String], default: 250 },
})

const emit = defineEmits(['select'])

const isOpen = ref(false)

// Cursor position in viewport coordinates, [clientX, clientY].
// v-menu treats an [x, y] target as a fixed point on screen.
// When it is null (e.g. opened by keyboard focus) the menu falls back
// to the activator element.
const point = ref(null)

// Track the cursor until the menu opens, so it appears where the
// pointer is at the end of the open delay. Once open, the point is
// frozen so the menu doesn't chase the mouse.
function trackCursor(e) {
  if (!isOpen.value) point.value = [e.clientX, e.clientY]
}

// Forget the point on close, so a later keyboard open uses the activator.
watch(isOpen, (open) => {
  if (!open) point.value = null
})

// Vuetify's activator props (hover/focus handlers, aria-*) plus ours.
// Ours are listed first so the point is set before Vuetify reacts.
function activatorProps(vuetifyProps) {
  return mergeProps(
    { onMouseenter: trackCursor, onMousemove: trackCursor },
    vuetifyProps,
  )
}

function choose(item) {
  emit('select', item)
  isOpen.value = false
}
</script>

<template>
  <v-menu
    v-model="isOpen"
    open-on-hover
    :target="point ?? undefined"
    :location="props.location"
    :offset="props.offset"
    :open-delay="props.openDelay"
    :close-delay="props.closeDelay"
  >
    <template #activator="{ props: menuProps }">
      <slot name="activator" :props="activatorProps(menuProps)" :is-open="isOpen" />
    </template>

    <slot :close="() => (isOpen = false)">
      <v-list density="compact">
        <v-list-item
          v-for="item in props.items"
          :key="item.value ?? item.title"
          :title="item.title"
          @click="choose(item)"
        />
      </v-list>
    </slot>
  </v-menu>
</template>
