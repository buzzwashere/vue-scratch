<script setup>
import { computed, ref, useId } from 'vue'
import ComboWithPicker from './ComboWithPicker.vue'
// ?raw makes Vite import the file's source text, so the code shown here
// always matches the component.
import comboSource from './ComboWithPicker.vue?raw'
import picklistSource from './Picklist.vue?raw'

// One "Combo with Picker" demo: titled panel, the component, a <> toggle that
// shows its source, and prototype helpers. Each instance keeps its own values.
defineProps({
  title: { type: String, default: 'Combo with Picker' },
  // Passed through to ComboWithPicker: 'start' or 'top'.
  buttonPosition: { type: String, default: 'start' },
})

const values = ref([])

// Prototype only: stands in for another component handing focus to this one.
const combo = ref(null)

const headingId = useId()
const featuresHeadingId = useId()

// The source files shown in the <> panel, in order.
const codeFiles = [
  { name: 'ComboWithPicker.vue', source: comboSource },
  { name: 'Picklist.vue', source: picklistSource },
]

// The code column shows one file at a time, picked with tabs.
const codeTab = ref(codeFiles[0].name)
const activeFile = computed(() => codeFiles.find((f) => f.name === codeTab.value))
const codeTabsId = useId()

// Which file was just copied (its icon shows a check for a moment), and the
// text for the screen-reader live region.
const copiedName = ref(null)
const copyStatus = ref('')
let copiedTimer

async function copyCode(file) {
  try {
    await copyText(file.source)
    copiedName.value = file.name
    copyStatus.value = `Copied ${file.name} to the clipboard.`
  } catch {
    copiedName.value = null
    copyStatus.value = `Couldn't copy ${file.name}.`
  }
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copiedName.value = null
    copyStatus.value = ''
  }, 2000)
}

// The Clipboard API only exists on secure pages (https or localhost); fall
// back to a hidden textarea + execCommand elsewhere, e.g. a LAN IP in dev.
async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  if (!ok) throw new Error('copy failed')
}
</script>

<template>
  <!--
    Two columns: the demo panel on the left, its source on the right.
    On narrow screens the code drops below instead.
  -->
  <div class="demo-layout">
    <!-- Column 1: the demo, with a features summary under it. -->
    <div class="demo-column">
    <!-- A labelled section, so it shows up as a named region. -->
    <section class="demo-panel" :aria-labelledby="headingId">
      <header class="demo-header">
        <h2 :id="headingId" class="text-subtitle-1 font-weight-medium">{{ title }}</h2>
      </header>

      <!-- Extra vertical space so the component stands apart inside the panel. -->
      <div class="px-4 py-8">
        <ComboWithPicker ref="combo" v-model="values" :button-position="buttonPosition" />

        <!--
          Prototype convenience: simulates arriving from another component,
          which should land on the first chip in error.
        -->
        <v-btn
          class="mt-6"
          variant="tonal"
          size="small"
          prepend-icon="mdi-target"
          @click="combo?.focusFirstError()"
        >
          Focus first error
        </v-btn>

        <p class="text-body-1 mt-2">
          Values: <strong>{{ values.length ? values.join(', ') : 'none' }}</strong>
        </p>
      </div>
    </section>

    <!-- Summary of what the component does. -->
    <section class="demo-panel" :aria-labelledby="featuresHeadingId">
      <header class="demo-header">
        <h2 :id="featuresHeadingId" class="text-subtitle-1 font-weight-medium">Features</h2>
      </header>
      <div class="px-4 py-4 text-body-2 features">
        <h3>Entering values</h3>
        <ul>
          <li>Type a value and press Enter to add it as a chip. Letters are uppercased as you type.</li>
          <li>
            <strong>Select from Picklist</strong>
            {{ buttonPosition === 'top' ? '(above the field, full width)' : '(left of the field, full height)' }}
            opens a dialog of codes; check one or more and choose <strong>Add selections</strong>.
            The button is disabled until something is checked.
          </li>
          <li>After adding from the picklist, the cursor goes into the field after the last chip. Cancel returns focus to the button.</li>
          <li>Each chip has an X to remove it. Backspace with an empty field, or the Left/Right arrows, highlight a chip; Delete removes it.</li>
        </ul>

        <h3>No duplicates</h3>
        <ul>
          <li>A value that's already a chip isn't added again, whether typed, picked, or produced by an edit. The message line says it's already added, and the existing chip stays where it is.</li>
        </ul>

        <h3>Validation</h3>
        <ul>
          <li>Values must match <code>AA-999-AAA</code> (two letters, three digits, three letters).</li>
          <li>Failing chips get a red border and an alert icon, and the message line lists them, so the error isn't shown by color alone.</li>
        </ul>

        <h3>Fixing errors in place</h3>
        <ul>
          <li>A failing chip's value is editable inside the chip. Tab onto it to edit with the value selected, or click it, press Enter/Space on it, or highlight it with the arrows and press Enter.</li>
          <li>Enter or leaving the chip saves; Escape cancels. Clearing the value removes the chip.</li>
          <li><strong>Focus first error</strong> (prototype helper) jumps straight to the first failing chip in edit mode.</li>
        </ul>

        <h3>Accessibility (Section 508 / JAWS)</h3>
        <ul>
          <li>Logical Tab order: Picklist button, each chip's controls, the field, then the page.</li>
          <li>The Picklist button sits outside the combobox, and dropdown roles are removed, so JAWS reads the button, field, and chip X buttons as separate controls.</li>
          <li>Remove buttons are named per value ("Remove AB-123-CDE"); editable chips say they're in error.</li>
          <li>The message line is tied to the field with aria-describedby and is a live region. A hidden live region also announces chips added, removed, saved, and highlighted.</li>
          <li>The picklist dialog is labelled by its title, and its checkboxes are grouped under a legend.</li>
        </ul>
      </div>
    </section>
    </div>

    <!-- Source code for the demo, always shown beside it. -->
    <section
      class="demo-code-column"
      :aria-label="`${title} code`"
    >
      <!-- File tabs, with a copy button for the shown file on the right. -->
      <div class="demo-code-header">
        <v-tabs
          v-model="codeTab"
          density="compact"
          color="primary"
          aria-label="Source files"
        >
          <v-tab
            v-for="(file, i) in codeFiles"
            :id="`${codeTabsId}-tab-${i}`"
            :key="file.name"
            :value="file.name"
            :aria-controls="`${codeTabsId}-panel-${i}`"
            class="text-none"
          >
            {{ file.name }}
          </v-tab>
        </v-tabs>
        <!-- Icon-only, so the aria-label names the file it copies. -->
        <v-btn
          :icon="copiedName === activeFile.name ? 'mdi-check' : 'mdi-content-copy'"
          :color="copiedName === activeFile.name ? 'success' : undefined"
          variant="text"
          size="small"
          density="comfortable"
          :aria-label="`Copy ${activeFile.name} to clipboard`"
          :title="`Copy ${activeFile.name}`"
          @click="copyCode(activeFile)"
        />
      </div>

      <!--
        One tab panel per file; only the selected one is shown. Each scrolls,
        so tabindex="0" lets keyboard users focus it and scroll with arrows.
      -->
      <pre
        v-for="(file, i) in codeFiles"
        v-show="codeTab === file.name"
        :id="`${codeTabsId}-panel-${i}`"
        :key="file.name"
        class="demo-code"
        role="tabpanel"
        tabindex="0"
        :aria-labelledby="`${codeTabsId}-tab-${i}`"
      ><code>{{ file.source }}</code></pre>
    </section>

    <!-- Announces "Copied …" to screen readers; visually hidden. -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">{{ copyStatus }}</div>
  </div>
</template>

<style scoped>
.demo-layout {
  display: grid;
  grid-template-columns: minmax(0, 640px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

/* Not enough room for two columns: put the code under the panel. */
@media (max-width: 1100px) {
  .demo-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

/*
 * Fixed to the window's height (below the app bar, title and tabs); the
 * shown file fills what's left under its tab bar and scrolls inside it.
 */
.demo-code-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 420px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  overflow: hidden;
}

.demo-code-column > .demo-code {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
}

/* The column has its own border, so the first header needs no top rule. */
.demo-code-column > .demo-code-header:first-child {
  border-top: 0;
}

.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.features h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 12px 0 4px;
}
.features h3:first-child {
  margin-top: 0;
}
.features ul {
  padding-left: 20px;
}
.features li {
  margin-bottom: 4px;
}

.demo-panel {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.demo-header {
  display: flex;
  align-items: center;
  /* Same height as the code column's tab bar, so the two headers line up. */
  min-height: 36px;
  padding: 0 8px 0 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  /* Light grey; follows the theme, so it stays subtle in dark mode too. */
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px 4px 0 0;
}

/* Filename on the left, copy button right-aligned. */
.demo-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 0;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  /* Same light grey as the demo panel's header. */
  background: rgba(var(--v-theme-on-surface), 0.05);
}

.demo-code {
  margin: 0;
  max-height: 480px;
  overflow: auto;
  padding: 16px;
  font-size: 12px;
  line-height: 1.5;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.04);
}

/* Visible focus ring on the scrollable code blocks. */
.demo-code:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
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
