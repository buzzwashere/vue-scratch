<script setup>
const items = [
  { id: 1, title: 'Quarterly revenue report', subtitle: 'Finance · updated 2 days ago' },
  { id: 2, title: 'Onboarding checklist', subtitle: 'People Ops · 14 steps remaining' },
  { id: 3, title: 'API rate limit incident', subtitle: 'Engineering · resolved, postmortem pending' },
  { id: 4, title: 'Spring product launch', subtitle: 'Marketing · launch date April 14' },
  { id: 5, title: 'Office move logistics', subtitle: 'Facilities · movers booked for Friday' },
  { id: 6, title: 'Customer satisfaction survey', subtitle: 'Support · 1,284 responses collected' },
  { id: 7, title: 'Design system audit', subtitle: 'Design · 37 components reviewed' },
  { id: 8, title: 'Vendor contract renewal', subtitle: 'Legal · expires end of month' },
]
</script>

<template>
  <h1 class="text-h5 mb-4">List layout</h1>

  <v-list lines="one" border rounded>
    <v-list-item v-for="item in items" :key="item.id">
      <div class="item-row">
        <v-list-item-title class="item-title">{{ item.title }}</v-list-item-title>
        <v-list-item-subtitle class="item-subtitle">{{ item.subtitle }}</v-list-item-subtitle>
      </div>
    </v-list-item>
  </v-list>
</template>

<style scoped>
/*
 * Two columns: a narrow, fixed-width title column (sized to fit the titles)
 * so the subtitle sits close to its title, and the subtitle takes the rest.
 */
.item-row {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  column-gap: 24px;
  align-items: baseline;
}

/* Let long text wrap instead of being truncated with an ellipsis. */
.item-title,
.item-subtitle {
  white-space: normal;
}

/*
 * Browser zoom shrinks the CSS viewport: at 300% a 1920px-wide window is 640 CSS px.
 * Below that width (zoom above ~300% on a 1080p-wide window, or a phone),
 * stack the subtitle under the title.
 */
@media (max-width: 640px) {
  .item-row {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 2px;
  }
}
</style>
