<template>
  <div class="w-full h-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

onMounted(() => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '平均得点',
          data: [2.5, 2.8, 2.6, 2.9, 2.7, 3.0],
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 0.5
          }
        }
      }
    }
  })
})
</script> 