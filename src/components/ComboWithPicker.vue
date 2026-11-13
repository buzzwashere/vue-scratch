<script setup>
import { computed, ref } from 'vue'
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

function openPicklist() {
  dialog.value = true
}

// Every value must look like AB-123-CDE (uppercase letters).
const CODE_PATTERN = /^[A-Z]{2}-\d{3}-[A-Z]{3}$/

function isValidCode(value) {
  return CODE_PATTERN.test(String(value))
}

const hasInvalid = computed(() => values.value.some((v) => !isValidCode(v)))

// One message for the whole field, shown only while a value fails.
const formatMessage = computed(() =>
  hasInvalid.value ? ['Values must be in the format AA-123-AAA'] : [],
)

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
      multiple + no items: typing a value and pressing Enter adds it to
      v-model, and chips/closable-chips render each one as a chip whose
      X removes it.
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
      :messages="formatMessage"
    >
      <!--
        props carries the chip's close handler; the combobox supplies its
        text, size and closable through defaults. Failing values get a red border.
      -->
      <template #chip="{ props, item }">
        <v-chip
          v-bind="props"
          :class="{ 'invalid-chip': !isValidCode(item.title) }"
        />
      </template>

      <!--
        messages + this slot shows red text under the field without putting
        the whole field into its error state, so only bad chips turn red.
      -->
      <template #message="{ message }">
        <span class="text-error">{{ message }}</span>
      </template>

      <!--
        #prepend-inner sits inside the field, before the chips. .stop keeps
        the click from also focusing the field or opening its menu.
      -->
      <template #prepend-inner>
        <v-btn
          class="picklist-btn"
          color="teal"
          variant="flat"
          @mousedown.stop
          @click.stop="openPicklist"
        >
          Picklist
        </v-btn>
      </template>
    </v-combobox>

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
</template>

<style scoped>
/* Give the field a taller box; it still grows past this as chips wrap. */
.tall-combobox :deep(.v-field) {
  min-height: 125px;
  /*
   * No left padding, so the Picklist button sits against the left border.
   * Vuetify adds 12px via .v-field--prepended when a prepend-inner slot is
   * used, so that has to be zeroed as well as --v-field-padding-start.
   */
  --v-field-padding-start: 0px;
  padding-inline-start: 0;
}

/* Stretch the prepend-inner slot to the field's full height... */
.tall-combobox :deep(.v-field__prepend-inner) {
  align-items: stretch;
  padding-top: 0;
  padding-bottom: 0;
}

/* ...and let the Picklist button fill it top to bottom. */
.tall-combobox :deep(.picklist-btn) {
  height: auto !important;
  /* Match the field's top-left corner; keep a gap before the chips. */
  border-radius: 4px 0 0 0;
  margin-inline-end: 8px;
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

/* Messages are dimmed by default; show the error text at full strength. */
.tall-combobox :deep(.v-messages) {
  opacity: 1;
}
</style>
