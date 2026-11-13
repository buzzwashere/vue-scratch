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
  return `Values must be in the format AA-123-AAA. Fix or remove: ${list}`
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
        v-model="values"
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
        -->
        <template #chip="{ props, item }">
          <v-chip
            v-bind="props"
            :class="{ 'invalid-chip': !isValidCode(item.title) }"
            :prepend-icon="isValidCode(item.title) ? undefined : 'mdi-alert-circle-outline'"
            :close-label="`Remove ${item.title}`"
          />
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
</style>
