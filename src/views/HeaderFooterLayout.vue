<script setup>
// Filler rows so you can see the content area scroll while the
// header and footer stay put.
const rows = Array.from({ length: 40 }, (_, i) => `Content row ${i + 1}`)
</script>

<template>
  <!--
    Flex column that fills the viewport below the app bar:
      header  -> 75px, never shrinks
      content -> takes all remaining height, scrolls on its own
      footer  -> 41px, pinned to the bottom of the window
  -->
  <div class="hf-page">
    <header class="hf-header">
      <h1 class="text-h6">Header (75px)</h1>
    </header>

    <div class="hf-content">
      <p v-for="row in rows" :key="row" class="mb-2">{{ row }}</p>
    </div>

    <footer class="hf-footer">
      <span class="text-body-2">Footer (41px, fixed)</span>
    </footer>
  </div>
</template>

<style scoped>
/*
 * Pin the page to the window, starting under Vuetify's app bar.
 * --v-layout-top is set by <v-main>, so this stays correct if the
 * app bar height changes. With no app bar it falls back to 0.
 */
.hf-page {
  position: fixed;
  top: var(--v-layout-top, 0px);
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
}

.hf-header {
  flex: 0 0 75px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
}

/* min-height: 0 lets the flex child shrink so overflow scrolls here, not the page. */
.hf-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.hf-footer {
  flex: 0 0 41px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
</style>
