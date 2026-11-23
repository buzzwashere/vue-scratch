<script setup>
import { computed, ref, useId } from 'vue'
import MenuHoverWithCursor from '../components/MenuHoverWithCursor.vue'
// ?raw makes Vite import the file's source text, so the code shown here
// always matches the files.
import pageSource from './MenuHoverCursor.vue?raw'
import menuSource from '../components/MenuHoverWithCursor.vue?raw'

const items = [
  { title: 'Open in new tab', value: 'new-tab' },
  { title: 'Copy link', value: 'copy' },
  { title: 'Add to favorites', value: 'favorite' },
]

const chosen = ref(null)

const headingId = useId()

// The source files shown in the code column, in order.
const codeFiles = [
  { name: 'MenuHoverCursor.vue', source: pageSource },
  { name: 'MenuHoverWithCursor.vue', source: menuSource },
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
  <h1 class="text-h5 mb-4">Menu hover at cursor</h1>

  <!--
    Two columns: the demo panel on the left, its source on the right.
    On narrow screens the code drops below instead.
  -->
  <div class="demo-layout">
    <div class="demo-column">
      <!-- A labelled section, so it shows up as a named region. -->
      <section class="demo-panel" :aria-labelledby="headingId">
        <header class="demo-header">
          <h2 :id="headingId" class="text-subtitle-1 font-weight-medium">Menu Hover with Cursor</h2>
        </header>

        <div class="px-4 py-8">
          <p class="text-body-1 mb-4">
            Hover the link below. The menu opens where your mouse pointer is, not
            under the link. Try entering the link from different spots along it.
          </p>

          <p class="text-body-1">
            Read more about
            <MenuHoverWithCursor :items="items" @select="chosen = $event">
              <!--
                Faux hyperlink: looks like a link but goes nowhere. tabindex makes
                it reachable by keyboard; focusing it opens the menu below the text.
              -->
              <template #activator="{ props }">
                <span v-bind="props" class="faux-link" tabindex="0" role="button">
                  the Vue Scratch project and its many pages
                </span>
              </template>
            </MenuHoverWithCursor>
            in the directory on the home page.
          </p>

          <p class="text-body-1 mt-4">
            Last chosen: <strong>{{ chosen ? chosen.title : 'none' }}</strong>
          </p>
        </div>
      </section>
    </div>

    <!-- Source code for the demo, always shown beside it. -->
    <section
      class="demo-code-column"
      :aria-label="'Menu hover at cursor code'"
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

.faux-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  cursor: pointer;
}
.faux-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
