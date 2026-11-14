<script setup>
import { ref, useId } from 'vue'
import ComboWithPicker from '../components/ComboWithPicker.vue'
// ?raw makes Vite import the file's source text, so the code shown here
// always matches the component.
import comboSource from '../components/ComboWithPicker.vue?raw'
import picklistSource from '../components/Picklist.vue?raw'

const values = ref([])

// Prototype only: stands in for another component handing focus to this one.
const combo = ref(null)
const showCode = ref(false)

const headingId = useId()
const codeId = useId()
</script>

<template>
  <h1 class="text-h5 mb-4">Combobox chips</h1>

  <!-- A labelled section, so it shows up as a named region. -->
  <section class="demo-panel" :aria-labelledby="headingId">
    <header class="demo-header">
      <h2 :id="headingId" class="text-subtitle-1 font-weight-medium">Combo with Picker</h2>
      <v-spacer />
      <!--
        Toggles the source view below the component. Outlined when closed,
        filled while open. aria-expanded/aria-controls tell screen readers
        what it toggles and whether it's open.
      -->
      <v-btn
        :variant="showCode ? 'flat' : 'outlined'"
        color="primary"
        size="small"
        class="font-monospace"
        :aria-expanded="showCode ? 'true' : 'false'"
        :aria-controls="codeId"
        :aria-label="showCode ? 'Hide code' : 'Show code'"
        @click="showCode = !showCode"
      >
        &lt;&gt;
      </v-btn>
    </header>

    <div class="pa-4">
      <ComboWithPicker ref="combo" v-model="values" />

      <!--
        Prototype convenience: simulates arriving from another component,
        which should land on the first chip in error.
      -->
      <v-btn
        class="mt-2"
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

    <v-expand-transition>
      <!--
        v-show hides it with display:none, so hidden code is out of the tab
        order. Each <pre> scrolls, so tabindex="0" lets keyboard users focus
        it and scroll with the arrow keys. role="region" makes the aria-label
        count: JAWS ignores aria-label on a plain <pre>.
      -->
      <div v-show="showCode" :id="codeId">
        <h3 class="demo-code-title">ComboWithPicker.vue</h3>
        <pre class="demo-code" role="region" tabindex="0" aria-label="ComboWithPicker.vue source"><code>{{ comboSource }}</code></pre>
        <h3 class="demo-code-title">Picklist.vue</h3>
        <pre class="demo-code" role="region" tabindex="0" aria-label="Picklist.vue source"><code>{{ picklistSource }}</code></pre>
      </div>
    </v-expand-transition>
  </section>
</template>

<style scoped>
.demo-panel {
  max-width: 640px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.demo-header {
  display: flex;
  align-items: center;
  padding: 4px 8px 4px 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  /* Light grey; follows the theme, so it stays subtle in dark mode too. */
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px 4px 0 0;
}

.demo-code-title {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
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
</style>
