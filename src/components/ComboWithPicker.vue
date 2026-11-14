<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import Picklist from './Picklist.vue'

// Values the user has entered (v-model on this component); each one renders as a chip.
const values = defineModel({ type: Array, default: () => [] })

// Where the Picklist button goes: 'start' = left of the field, full height;
// 'top' = above the field, full width.
defineProps({
  buttonPosition: {
    type: String,
    default: 'start',
    validator: (v) => ['start', 'top'].includes(v),
  },
})

// Whether the Picklist dialog is open.
const dialog = ref(false)

// The Picklist button, so focus can go back to it when the dialog closes.
const picklistBtn = ref(null)

function openPicklist() {
  dialog.value = true
}

// ----- Uppercase as you type -----
// Uppercase an input's text in place, keeping the caret where it was
// (replacing the value would otherwise jump it to the end). Returns the text.
function uppercaseInPlace(el) {
  const upper = el.value.toUpperCase()
  if (upper !== el.value) {
    const { selectionStart, selectionEnd } = el
    el.value = upper
    el.setSelectionRange(selectionStart, selectionEnd)
  }
  return upper
}

// Main input: Vuetify reports each change of the typed text through
// update:search. v-combobox keeps that text internally (it ignores a :search
// prop), so write the uppercase version back through its exposed `search`,
// then put the caret back where it was, since rewriting the input's value
// moves the caret to the end.
function onSearchUpdate(text) {
  const raw = text ?? ''
  if (raw) duplicateNotice.value = ''
  const upper = raw.toUpperCase()
  if (upper === raw || !comboRef.value) return
  const el = comboRef.value.$el?.querySelector('input:not(.chip-edit-input)')
  const start = el?.selectionStart
  const end = el?.selectionEnd
  comboRef.value.search = upper
  nextTick(() => {
    if (el && document.activeElement === el && start != null) el.setSelectionRange(start, end)
  })
}

// Inline chip editor.
function onEditInput(e) {
  draft.value = uppercaseInPlace(e.target)
}

// Set by addSelections so the close handler knows codes were just added.
let addedFromPicklist = false

// The dialog is opened by v-model rather than an activator, so Vuetify has
// nowhere to return focus; we choose. After Add selections the caret goes in
// the main input (it sits after the last chip) so the user can keep typing;
// after Cancel/Escape focus goes back to the Picklist button.
watch(dialog, (open) => {
  if (open) return
  const toInput = addedFromPicklist
  addedFromPicklist = false
  nextTick(() => {
    if (toInput) focusMainInput()
    else picklistBtn.value?.$el?.focus()
  })
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
  if (duplicateNotice.value) return duplicateNotice.value
  if (!hasInvalid.value) return 'Format AA-999-AAA. Press Enter to add each value.'
  const list = invalidValues.value.join(', ')
  return `Values must be in the format AA-999-AAA. Select a value to edit it, or remove it: ${list}`
})

// ----- No duplicate chips -----
// Shown in the message line (so sighted users see why nothing was added, and
// the live region reads it) until the user next types or the values change.
const duplicateNotice = ref('')

function showDuplicates(dupes) {
  if (!dupes.length) return
  const list = [...new Set(dupes)].join(', ')
  duplicateNotice.value =
    dupes.length === 1 ? `${list} is already added.` : `Already added, skipped: ${list}.`
}

watch(values, () => (duplicateNotice.value = ''))

// Enter in the main input with a value that's already a chip. Vuetify would
// "re-select" it, which moves the existing chip to the end, so catch Enter
// first (capture phase on the wrapper, before Vuetify's own handler), leave
// the chips alone, clear the typed text and say why.
function onRowKeydownCapture(e) {
  if (e.key !== 'Enter' || editingIndex.value !== null) return
  if (!e.target.matches?.('input:not(.chip-edit-input)')) return
  if ((comboRef.value?.selectionIndex ?? -1) >= 0) return
  const text = String(comboRef.value?.search ?? '').trim().toUpperCase()
  if (!text || !values.value.includes(text)) return
  e.preventDefault()
  e.stopPropagation()
  comboRef.value.search = ''
  showDuplicates([text])
}

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

// v-combobox adds dropdown ARIA (aria-haspopup, aria-expanded, aria-controls,
// aria-owns) to the field box and input. With role="" there is no dropdown,
// so JAWS would announce a plain edit box as "collapsed" / "has popup".
// Vuetify re-applies them on every render, so strip them whenever they appear.
const MENU_ARIA = ['aria-haspopup', 'aria-expanded', 'aria-controls', 'aria-owns']
let ariaObserver

function stripMenuAria(root) {
  root.querySelectorAll('.v-field, input:not(.chip-edit-input)').forEach((el) => {
    MENU_ARIA.forEach((name) => el.hasAttribute(name) && el.removeAttribute(name))
  })
}

onMounted(() => {
  const root = comboRef.value?.$el
  if (!root) return
  stripMenuAria(root)
  ariaObserver = new MutationObserver(() => stripMenuAria(root))
  ariaObserver.observe(root, { subtree: true, attributes: true, attributeFilter: MENU_ARIA })
})

onBeforeUnmount(() => ariaObserver?.disconnect())

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
// e is the blur event when the user tabbed/clicked away.
function commitEdit(e) {
  if (editingIndex.value === null) return
  if (cancelling) {
    cancelling = false
    return
  }
  const index = editingIndex.value
  const text = draft.value.trim()
  editingIndex.value = null
  // Chips are keyed by value, so changing the value rebuilds this chip and
  // drops focus if it had just moved to the chip's own X (Tab). Note that
  // case so focus can be put back on the rebuilt chip.
  const chipEl = e?.target?.closest?.('.v-combobox__selection')
  const focusStayedInChip = !!chipEl && chipEl.contains(e.relatedTarget)
  const next = [...values.value]
  // Edited into a value that another chip already has: drop this chip.
  const duplicate = !!text && next.some((v, i) => i !== index && v === text)
  if (text && !duplicate) next.splice(index, 1, text)
  else next.splice(index, 1)
  values.value = next
  nextTick(() => {
    if (focusStayedInChip) {
      const chips = comboRef.value?.$el?.querySelectorAll('.v-combobox__selection') ?? []
      // Same chip's X, or (if the chip was removed) the next chip's first control.
      const target = text && !duplicate
        ? chips[index]?.querySelector('.v-chip__close')
        : chips[index]?.querySelector('button')
      if (target) target.focus()
      else focusMainInput()
    }
    if (duplicate) showDuplicates([text])
    else if (!text) announcement.value = 'Value removed.'
    else if (isValidCode(text)) announcement.value = `Saved ${text}.`
    else announcement.value = `Saved ${text}. Still not in the format AA-999-AAA.`
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
// swallow it.
function onChipTextKeydown(e, index) {
  if (['Enter', ' '].includes(e.key)) {
    e.preventDefault()
    startEdit(index)
  }
}

// Keys in the main input. The combobox lets you move onto chips with the
// Left/Right arrows (Backspace/Delete then removes the highlighted one).
// Add: Enter on a highlighted failing chip edits it.
function onComboKeydown(e) {
  if (editingIndex.value !== null) return
  const selected = comboRef.value?.selectionIndex ?? -1
  if (e.key !== 'Enter' || selected < 0) return
  const index = selected
  if (isValidCode(values.value[index])) return
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
      : `${value}, not in the format AA-999-AAA. Press Enter to edit, Delete to remove.`
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
  const toAdd = [...new Set(codes)].filter((code) => !values.value.includes(code))
  const skipped = codes.filter((code) => values.value.includes(code))
  if (toAdd.length) values.value = [...values.value, ...toAdd]
  // After the values watcher has cleared any old notice.
  nextTick(() => showDuplicates(skipped))
  addedFromPicklist = true
}

// For parent components: jump to the first failing chip, in edit mode with
// its value selected (same as tabbing onto it). With no failing chips, focus
// the main input instead. Returns true if a failing chip was found.
function focusFirstError() {
  const index = values.value.findIndex((v) => !isValidCode(v))
  if (index < 0) {
    focusMainInput()
    nextTick(() => (announcement.value = 'No values in error.'))
    return false
  }
  startEdit(index, { selectAll: true })
  return true
}

defineExpose({ focusFirstError })
</script>

<template>
  <div style="max-width: 560px; margin-inline: auto">
    <!--
      The Picklist button is a sibling of the combobox, not inside it.
      Vuetify puts role="combobox" on the .v-field box, so anything in the
      prepend-inner slot became a child of the combobox, and screen readers
      such as JAWS treat a combobox's children as part of it rather than as
      separate controls. Out here it's a plain, standalone button. CSS joins
      the two so they still look like one control.
    -->
    <div
      class="combo-row"
      :class="{ 'combo-row--top': buttonPosition === 'top' }"
      @keydown.capture="onRowKeydownCapture"
    >
      <v-btn
        ref="picklistBtn"
        class="picklist-btn"
        color="teal-darken-2"
        variant="flat"
        @click="openPicklist"
      >
        Select from Picklist
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
        @update:search="onSearchUpdate"
        class="tall-combobox"
        label="... or Enter Values"
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
          starts editing with the value selected; clicking it, or Enter/Space,
          also starts editing. From the main input, Left/Right arrow onto a
          failing chip and press Enter. Enter or
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
              :value="draft"
              @input="onEditInput"
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
              :aria-label="`Edit ${item.title}, not in the format AA-999-AAA`"
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
  /* The filled variant only draws a bottom line; add top and right borders
     in the same color and strength as that line. */
  border-top: 1px solid rgba(var(--v-theme-on-surface), var(--v-field-border-opacity, 0.38));
  border-right: 1px solid rgba(var(--v-theme-on-surface), var(--v-field-border-opacity, 0.38));
  /* Square left corner where it meets the Picklist button; round the outer
     bottom-right corner to match the button's outer corners. */
  border-top-left-radius: 0;
  border-bottom-right-radius: 4px;
}

/* Joined to the field: no gap, rounded only on its outer (left) corners. */
.picklist-btn {
  height: auto !important;
  border-radius: 4px 0 0 4px;
  /* Keep the width the old one-word "Picklist" button had; the longer
     label wraps onto extra lines instead of widening the button. */
  width: 106px;
  min-width: 0;
  padding-inline: 8px;
}

/* Vuetify keeps button text on one line; allow wrapping here. */
.picklist-btn :deep(.v-btn__content) {
  white-space: normal;
  line-height: 1.3;
  text-align: center;
}

/* buttonPosition="top": button stacked above the field, same width as it. */
.combo-row--top {
  flex-direction: column;
}

.combo-row--top .picklist-btn {
  width: 100%;
  height: 40px !important;
  border-radius: 4px 4px 0 0;
}

.combo-row--top .tall-combobox :deep(.v-field) {
  /* Both top corners meet the button now. */
  border-top-right-radius: 0;
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

/* Red border on chips whose value isn't AA-999-AAA. */
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
