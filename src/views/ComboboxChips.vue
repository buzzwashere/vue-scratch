<script setup>
import { ref } from 'vue'
import ComboWithPicker from '../components/ComboWithPicker.vue'
// ?raw makes Vite import the file's source text, so the code shown here
// always matches the component.
import comboSource from '../components/ComboWithPicker.vue?raw'
import picklistSource from '../components/Picklist.vue?raw'

const values = ref([])
const showCode = ref(false)
</script>

<template>
  <h1 class="text-h5 mb-4">Combobox chips</h1>

  <div class="demo-panel">
    <header class="demo-header">
      <span class="text-subtitle-1 font-weight-medium">Combo with Picker</span>
      <v-spacer />
      <!-- Toggles the source view below the component. -->
      <!-- Outlined when closed, filled while the code is showing. -->
      <v-btn
        :variant="showCode ? 'flat' : 'outlined'"
        color="primary"
        size="small"
        class="font-monospace"
        :aria-expanded="showCode"
        aria-label="Show code"
        @click="showCode = !showCode"
      >
        &lt;&gt;
      </v-btn>
    </header>

    <div class="pa-4">
      <ComboWithPicker v-model="values" />

      <p class="text-body-1 mt-2">
        Values: <strong>{{ values.length ? values.join(', ') : 'none' }}</strong>
      </p>
    </div>

    <v-expand-transition>
      <div v-show="showCode">
        <div class="demo-code-title">ComboWithPicker.vue</div>
        <pre class="demo-code"><code>{{ comboSource }}</code></pre>
        <div class="demo-code-title">Picklist.vue</div>
        <pre class="demo-code"><code>{{ picklistSource }}</code></pre>
      </div>
    </v-expand-transition>
  </div>
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
</style>
