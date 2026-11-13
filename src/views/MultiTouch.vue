<script setup>
import { computed, ref } from 'vue'

// Eight buttons: four corners plus the middle of each edge.
const buttons = [
  { id: 'alpha', title: 'Alpha', color: '#e53935', position: 'top-left' },
  { id: 'bravo', title: 'Bravo', color: '#fb8c00', position: 'top' },
  { id: 'charlie', title: 'Charlie', color: '#c49000', position: 'top-right' },
  { id: 'delta', title: 'Delta', color: '#43a047', position: 'right' },
  { id: 'echo', title: 'Echo', color: '#00897b', position: 'bottom-right' },
  { id: 'foxtrot', title: 'Foxtrot', color: '#1e88e5', position: 'bottom' },
  { id: 'golf', title: 'Golf', color: '#5e35b1', position: 'bottom-left' },
  { id: 'hotel', title: 'Hotel', color: '#d81b60', position: 'left' },
]

// Active button ids, in the order they were turned on.
const activeIds = ref([])

const activeButtons = computed(() =>
  activeIds.value.map((id) => buttons.find((button) => button.id === id)),
)

function toggle(id) {
  const index = activeIds.value.indexOf(id)
  if (index === -1) activeIds.value.push(id)
  else activeIds.value.splice(index, 1)
}

// pointerdown fires once per finger, so several buttons can be toggled at the
// same moment on a touch screen; with a mouse it behaves like a click.
function onPointerDown(event, id) {
  if (event.button !== 0) return
  toggle(id)
}

// Keyboard activation (Enter / Space) arrives as a click with detail 0.
// Pointer-driven clicks are ignored because pointerdown already toggled.
function onClick(event, id) {
  if (event.detail === 0) toggle(id)
}
</script>

<template>
  <div class="stage">
    <button
      v-for="button in buttons"
      :key="button.id"
      type="button"
      class="touch-button"
      :class="[`pos-${button.position}`, { active: activeIds.includes(button.id) }]"
      :style="{ '--button-color': button.color }"
      :aria-pressed="activeIds.includes(button.id)"
      @pointerdown="onPointerDown($event, button.id)"
      @click="onClick($event, button.id)"
      @contextmenu.prevent
    >
      {{ button.title }}
    </button>

    <div class="center" aria-live="polite">
      <TransitionGroup name="title">
        <div
          v-for="button in activeButtons"
          :key="button.id"
          class="center-title"
          :style="{ color: button.color }"
        >
          {{ button.title }}
        </div>
      </TransitionGroup>
      <p v-if="activeButtons.length === 0" class="hint">Touch or click a button</p>
    </div>
  </div>
</template>

<style scoped>
.stage {
  --size: 175px;
  --gap: 16px;
  position: relative;
  /* Fill the viewport below the compact app bar (48px) and container padding (2 Ã— 16px). */
  height: calc(100dvh - 80px);
  min-height: calc(3 * var(--size) + 4 * var(--gap));
  min-width: calc(3 * var(--size) + 4 * var(--gap));
  user-select: none;
}

.touch-button {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border: 4px solid var(--button-color);
  border-radius: 16px;
  background: transparent;
  color: var(--button-color);
  font-size: 1.5rem;
  font-weight: 600;
  /* No scrolling, zooming or double-tap delay while touching the buttons. */
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  transition: background-color 150ms, color 150ms, transform 150ms, box-shadow 150ms;
}

.touch-button.active {
  background: var(--button-color);
  color: #fff;
  text-shadow: 0 1px 2px rgb(0 0 0 / 40%);
  box-shadow: 0 6px 18px rgb(0 0 0 / 25%);
  transform: scale(0.96);
}

.touch-button:focus-visible {
  outline: 3px solid #000;
  outline-offset: 3px;
}

.pos-top-left { top: var(--gap); left: var(--gap); }
.pos-top { top: var(--gap); left: 50%; translate: -50% 0; }
.pos-top-right { top: var(--gap); right: var(--gap); }
.pos-right { top: 50%; right: var(--gap); translate: 0 -50%; }
.pos-bottom-right { bottom: var(--gap); right: var(--gap); }
.pos-bottom { bottom: var(--gap); left: 50%; translate: -50% 0; }
.pos-bottom-left { bottom: var(--gap); left: var(--gap); }
.pos-left { top: 50%; left: var(--gap); translate: 0 -50%; }

/* The middle area, inside the ring of buttons. */
.center {
  position: absolute;
  inset: calc(var(--size) + 2 * var(--gap));
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 8px 24px;
  overflow: auto;
}

.center-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.hint {
  align-self: center;
  color: rgb(0 0 0 / 45%);
  font-size: 1.25rem;
}

.title-enter-active,
.title-leave-active {
  transition: opacity 200ms, transform 200ms;
}

.title-enter-from,
.title-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
