<script setup>
import { computed, ref } from 'vue'
import { charts } from '@/data/charts'

const songs = [
  { title: 'These Are Days', artist: '10000 Maniacs' },
  { title: 'Overjoyed', artist: 'Stevie Wonder' },
]

const activeSong = ref(null)
const dialogOpen = ref(false)
const activeChart = computed(() => (activeSong.value ? charts[activeSong.value.title] : null))

function openChart(song) {
  activeSong.value = song
  dialogOpen.value = true
}
</script>

<template>
  <h1 class="text-h5 mb-4">Charts</h1>

  <v-list border rounded max-width="500">
    <v-list-item
      v-for="song in songs"
      :key="`${song.title}-${song.artist}`"
      :title="song.title"
      :subtitle="song.artist"
      prepend-icon="mdi-music-note"
      @click="openChart(song)"
    />
  </v-list>

  <v-dialog v-model="dialogOpen" max-width="720" scrollable>
    <v-card v-if="activeSong">
      <v-card-title class="d-flex align-center">
        <div>
          <div>{{ activeSong.title }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">{{ activeSong.artist }}</div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" aria-label="Close chart" @click="dialogOpen = false" />
      </v-card-title>

      <v-card-text v-if="activeChart">
        <v-alert v-if="activeChart.draft" type="warning" variant="tonal" density="compact" class="mb-4">
          Draft: {{ activeChart.draft }}
        </v-alert>

        <div class="d-flex flex-wrap ga-2 mb-4">
          <v-chip size="small">Key: {{ activeChart.key }}</v-chip>
          <v-chip size="small">Tempo: {{ activeChart.tempo }}</v-chip>
          <v-chip size="small">Time: {{ activeChart.time }}</v-chip>
          <v-chip v-if="activeChart.capo" size="small">{{ activeChart.capo }}</v-chip>
        </div>

        <section v-for="section in activeChart.sections" :key="section.name" class="mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ section.name }}</h3>
          <div v-for="(line, i) in section.lines" :key="i" class="chart-line">
            <div class="bars">
              <span v-for="(bar, j) in line.bars" :key="j" class="bar">{{ bar }}</span>
            </div>
            <span v-if="line.repeat" class="repeat">×{{ line.repeat }}</span>
          </div>
        </section>

        <ul v-if="activeChart.notes?.length" class="text-body-2 text-medium-emphasis ps-4">
          <li v-for="note in activeChart.notes" :key="note">{{ note }}</li>
        </ul>
      </v-card-text>

      <v-card-text v-else>No chart for this song yet.</v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.chart-line {
  display: flex;
  align-items: center;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 1.05rem;
}

/* Each bar is a fixed-width cell with bar lines on the left; the last also closes on the right. */
.bar {
  width: 4.5rem;
  padding: 2px 8px;
  border-left: 1px solid rgb(0 0 0 / 35%);
}

.bars {
  display: flex;
}

.bar:last-child {
  border-right: 1px solid rgb(0 0 0 / 35%);
}

.repeat {
  margin-left: 12px;
  font-weight: 600;
}
</style>
