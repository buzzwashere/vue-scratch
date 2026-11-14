<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'
import Picklist from './Picklist.vue'

// Values the user has entered (v-model on this component); each one renders as a chip.
const values = defineModel({ type: Array, default: () => [] })

// Text currently typed in the field (not yet a chip).
const search = ref('')
const focused = ref(false)

// Show the hint only while the user is typing something in the field.
const showHint = computed(() => focused.value && !!search.value?.trim())

// Whether the Picklist dialog is open.
const dialog = ref(false)

// The Picklist button, so focus can go back to it when the dialog closes.
const picklistBtn = ref(null)

function openPicklist() {
  dialog.value = true
}

// The dialog is opened by v-model rather than an activator, so Vuetify has
// nowhere to return focus. Put it back on the Picklist button ourselves.
watch(dialog, (open) => {
  if (!open) nextTick(() => picklistBtn.value?.$el?.focus())
})

// Every value must look like AB-123-CDE (uppercase letters).
const CODE_PATTERN = /^[A-Z]{2}-\d{3}-[A-Z]{3}$/

function isValidCode(value) {
  return CODE_PATTERN.test(String(value))
}

const invalidValues = computed(() => values.value.filter((v) => !isValidCode(v)))
const hasInvalid = computed(() => invalidValues.value.length > 0)

// The message line under the field. It is linked to the input by
// aria-describedby and is an aria-live region, so screen readers hear the instructions on focus
// and hear the error as soon as it appears. The error names the failing values,
// so it doesn't rely on the red border alone.
const fieldMessage = computed(() => {
  if (!hasInvalid.value) return 'Format AA-123-AAA. Press Enter to add each value.'
  const list = invalidValues.value.join(', ')
  return `Values must be in the format AA-123-AAA. Press F2 to edit, or remove: ${list}`
})

// Id for the message line, which the input points at with aria-describedby.
const messageId = useId()

// Screen-reader-only announcement of chips being added or removed.
const announcement = ref('')
watch(values, (now, before = []) => {
  const added = now.filter((v) => !before.includes(v))
  const removed = before.filter((v) => !now.includes(v))
  const parts = []
  if (added.length) parts.push(`Added ${added.join(', ')}`)
  if (removed.length) parts.push(`Removed ${removed.join(', ')}`)
  if (parts.length) announcement.value = `${parts.join('. ')}. ${now.length} values.`
})

// ----- Editing a failing chip in place -----
// The combobox component: used to find the inputs inside it and to read
// which chip the arrow keys have highlighted (selectionIndex).
const comboRef = ref(null)

// Index of the chip being edited (null when none) and the text being typed.
const editingIndex = ref(null)
const draft = ref('')
// Set when Escape cancels, so the blur that follows doesn't save.
let cancelling = false

// Turn the chip's text into an input and focus it. selectAll selects the
// whole value (used when Tab lands on the chip); otherwise the caret goes
// to the end, so typing fixes rather than replaces.
function startEdit(index, { selectAll = false } = {}) {
  editingIndex.value = index
  draft.value = String(values.value[index])
  nextTick(() => {
    const input = comboRef.value?.$el?.querySelector('.chip-edit-input')
    input?.focus()
    if (selectAll) {
      input?.select()
    } else {
      const end = input?.value.length ?? 0
      input?.setSelectionRange(end, end)
    }
  })
}

// Save the edit (Enter or leaving the input). An empty value removes the chip.
function commitEdit() {
  if (editingIndex.value === null) return
  if (cancelling) {
    cancelling = false
    return
  }
  const index = editingIndex.value
  const text = draft.value.trim()
  editingIndex.value = null
  const next = [...values.value]
  if (text) next.splice(index, 1, text)
  else next.splice(index, 1)
  values.value = next
  nextTick(() => {
    if (!text) announcement.value = 'Value removed.'
    else if (isValidCode(text)) announcement.value = `Saved ${text}.`
    else announcement.value = `Saved ${text}. Still not in the format AA-123-AAA.`
  })
}

function cancelEdit() {
  cancelling = true
  editingIndex.value = null
  announcement.value = 'Edit cancelled.'
  // Removing the input blurs it; the flag stops that blur from saving.
  nextTick(() => (cancelling = false))
}

// After Enter or Escape, put focus back in the main input.
function focusMainInput() {
  nextTick(() => comboRef.value?.$el?.querySelector('input:not(.chip-edit-input)')?.focus())
}

// Tabbing onto a failing chip's text goes straight into editing with the
// value selected. A mouse press also focuses the button, so it's flagged
// and left to the click handler (caret at the end) instead.
let pointerDown = false

function onChipTextFocus(index) {
  if (pointerDown) return
  startEdit(index, { selectAll: true })
}

function onChipTextMousedown() {
  pointerDown = true
  // Cleared after the click (or if the press is dragged off the button).
  setTimeout(() => (pointerDown = false), 500)
}

// Keys on a failing chip's text button. Handled directly rather than relying
// on the browser turning Enter/Space into a click, so nothing upstream can
// swallow it. F2 is the usual "edit this" key.
function onChipTextKeydown(e, index) {
  if (['Enter', ' ', 'F2'].includes(e.key)) {
    e.preventDefault()
    startEdit(index)
  }
}

// Keys in the main input. The combobox lets you move onto chips with the
// Left/Right arrows (Backspace/Delete then removes the highlighted one).
// Add: Enter or F2 on a highlighted failing chip edits it, and F2 with no
// chip highlighted edits the first failing chip.
function onComboKeydown(e) {
  if (editingIndex.value !== null) return
  const selected = comboRef.value?.selectionIndex ?? -1
  const isEditKey = e.key === 'F2' || (e.key === 'Enter' && selected > -1)
  if (!isEditKey) return
  let index = selected
  if (index < 0) index = values.value.findIndex((v) => !isValidCode(v))
  if (index < 0 || isValidCode(values.value[index])) return
  e.preventDefault()
  startEdit(index)
}

// Announce the chip the arrow keys land on, since the highlight is only visual.
watch(
  () => comboRef.value?.selectionIndex,
  (index) => {
    if (index == null || index < 0) return
    const value = values.value[index]
    if (value === undefined) return
    announcement.value = isValidCode(value)
      ? `${value}. Press Delete to remove.`
      : `${value}, not in the format AA-123-AAA. Press Enter or F2 to edit, Delete to remove.`
  },
)

function onEditKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    commitEdit()
    focusMainInput()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
    focusMainInput()
  }
}

// Add the codes picked in the dialog as chips, skipping any already in the field.
function addSelections(codes) {
  const toAdd = codes.filter((code) => !values.value.includes(code))
  values.value = [...values.value, ...toAdd]
}
</script>

<template>
  <!-- Wrapper is the tooltip's activator, so the tooltip anchors to the field. -->
  <div style="max-width: 560px">
    <!--
      The Picklist button is a sibling of the combobox, not inside it.
      Vuetify puts role="combobox" on the .v-field box, so anything in the
      prepend-inner slot became a child of the combobox, and screen readers
      such as JAWS treat a combobox's children as part of it rather than as
      separate controls. Out here it's a plain, standalone button. CSS joins
      the two so they still look like one control.
    -->
    <div class="combo-row">
      <v-btn
        ref="picklistBtn"
        class="picklist-btn"
        color="teal-darken-2"
        variant="flat"
        @click="openPicklist"
      >
        Picklist
      </v-btn>

      <!--
        multiple + no items: typing a value and pressing Enter adds it to
        v-model, and chips/closable-chips render each one as a chip whose
        X removes it.

        role="": Vuetify puts role="combobox" on both the field box and the
        input. There is no dropdown list here, so that role is misleading, and
        on the box it hides the chips' remove buttons from JAWS (children of a
        combobox aren't exposed as separate controls). An empty role falls
        back to the native semantics: a plain text input, and real buttons.
      -->
      <v-combobox
        ref="comboRef"
        v-model="values"
        @keydown="onComboKeydown"
        v-model:search="search"
        v-model:focused="focused"
        class="tall-combobox"
        label="Enter values"
        multiple
        chips
        closable-chips
        hide-no-data
        hide-details
        role=""
        :aria-describedby="messageId"
        :aria-invalid="hasInvalid ? 'true' : undefined"
      >
        <!--
          props carries the chip's close handler; the combobox supplies its
          text, size and closable through defaults. Failing values get a red border
          plus an alert icon, so the state isn't shown by color alone.
          close-label names the value, so the X button reads "Remove AB-123-CDE"
          instead of just "Close".

          Failing chips can be edited in place: their text is a button
          ("Edit AB-12") that swaps to an input inside the chip. Tabbing onto it
          starts editing with the value selected; clicking it, or Enter/Space/F2,
          also starts editing. From the main input, Left/Right arrow onto a
          failing chip and press Enter or F2, or press F2 to edit the first
          failing chip. Enter or
          leaving the input saves, Escape cancels. The input and button stop
          keydown/mousedown/click from bubbling, because the chip treats
          Enter/Space as "remove this chip" and the combobox field reacts to
          keys and clicks as if they were meant for its own input.
        -->
        <template #chip="{ props, item, index }">
          <v-chip
            v-bind="props"
            :class="{ 'invalid-chip': !isValidCode(item.title) }"
            :prepend-icon="isValidCode(item.title) ? undefined : 'mdi-alert-circle-outline'"
            :close-label="`Remove ${item.title}`"
          >
            <input
              v-if="editingIndex === index"
              v-model="draft"
              class="chip-edit-input"
              :size="Math.max(draft.length, 10)"
              :aria-label="`Edit value ${item.title}`"
              :aria-describedby="messageId"
              @keydown.stop="onEditKeydown"
              @mousedown.stop
              @click.stop
              @blur="commitEdit"
            />
            <button
              v-else-if="!isValidCode(item.title)"
              type="button"
              class="chip-text-btn"
              tabindex="0"
              :aria-label="`Edit ${item.title}, not in the format AA-123-AAA`"
              title="Click to edit"
              @keydown.stop="onChipTextKeydown($event, index)"
              @focus="onChipTextFocus(index)"
              @mousedown.stop="onChipTextMousedown"
              @click.stop="startEdit(index)"
            >
              {{ item.title }}
            </button>
            <template v-else>{{ item.title }}</template>
          </v-chip>
        </template>

      </v-combobox>
    </div>

    <!--
      Message line, rendered here (not via the combobox's messages) so the
      Picklist button can match the field's height. Red text only for the
      error, so the field itself doesn't go into its error state.
    -->
    <div
      :id="messageId"
      class="combo-message text-caption"
      :class="{ 'text-error': hasInvalid }"
      aria-live="polite"
    >
      {{ fieldMessage }}
    </div>

    <!-- Controlled by showHint only; hover/focus triggers are turned off. -->
    <v-tooltip
      :model-value="showHint"
      activator="parent"
      location="top"
      :open-on-hover="false"
      :open-on-focus="false"
      :open-on-click="false"
    >
      Press Enter to complete value
    </v-tooltip>
  </div>


  <Picklist v-model="dialog" @add="addSelections" />

  <!-- Polite live region for add/remove announcements; visually hidden. -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</div>
</template>

<style scoped>
/* Button and combobox side by side, the button as tall as the field. */
.combo-row {
  display: flex;
  align-items: stretch;
}

.combo-row .tall-combobox {
  flex: 1 1 auto;
}

/* Give the field a taller box; it still grows past this as chips wrap. */
.tall-combobox :deep(.v-field) {
  min-height: 125px;
  /* Square left corner where it meets the Picklist button. */
  border-top-left-radius: 0;
}

/* Joined to the field: no gap, rounded only on the outer top-left corner. */
.picklist-btn {
  height: auto !important;
  border-radius: 4px 0 0 0;
}

.combo-message {
  min-height: 20px;
  padding: 4px 16px 0;
}

/*
 * Lighter grey fill. The filled variant's grey is an overlay of the text
 * color at 4% opacity (more on hover/focus); these halve each of those.
 */
.tall-combobox :deep(.v-field.v-field--variant-filled .v-field__overlay) {
  opacity: 0.02;
}
@media (hover: hover) {
  .tall-combobox :deep(.v-field.v-field--variant-filled:hover .v-field__overlay) {
    opacity: calc((0.02 + var(--v-hover-opacity) / 2) * var(--v-theme-overlay-multiplier));
  }
}
.tall-combobox :deep(.v-field.v-field--variant-filled.v-field--focused .v-field__overlay) {
  opacity: calc((0.02 + var(--v-focus-opacity) / 2) * var(--v-theme-overlay-multiplier));
}

/* Red border on chips whose value isn't AA-123-AAA. */
.tall-combobox :deep(.invalid-chip) {
  border: 2px solid rgb(var(--v-theme-error));
}


/* Hidden visually but still read by screen readers. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* The text of a failing chip: a button that looks like text, hinting it's editable. */
.chip-text-btn {
  font: inherit;
  color: inherit;
  cursor: text;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  border-radius: 2px;
}

.chip-text-btn:focus-visible,
.chip-edit-input:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 1px;
}

/* Inline input that replaces a chip's text while editing. */
.chip-edit-input {
  font: inherit;
  color: inherit;
  background: rgb(var(--v-theme-surface));
  border-radius: 2px;
  padding: 0 2px;
  min-width: 0;
}

</style>
