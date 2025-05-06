<template>
	<div class="flex justify-center items-center w-full h-90">
		<Radar :data="chartData" :options="chartOptions" />
	</div>
</template>

<script setup lang="ts">
import { Radar } from 'vue-chartjs';
import {
	Chart as ChartJS,
	RadialLinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
	Legend,
} from 'chart.js';
import { ref, watch } from 'vue';

ChartJS.register(
	RadialLinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
	Legend
);

interface Props {
	stats: {
		pace: number;
		shooting: number;
		passing: number;
		dribbling: number;
		defending: number;
		physical: number;
	};
}

const props = defineProps<Props>();

const chartData = ref({
	labels: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
	datasets: [
		{
			label: '現在の能力値',
			data: [
				Math.max(60, props.stats.pace || 0),
				Math.max(60, props.stats.shooting || 0),
				Math.max(60, props.stats.passing || 0),
				Math.max(60, props.stats.dribbling || 0),
				Math.max(60, props.stats.defending || 0),
				Math.max(60, props.stats.physical || 0),
			],
			backgroundColor: 'rgba(59, 130, 246, 0.2)',
			borderColor: 'rgb(59, 130, 246)',
			borderWidth: 2,
		},
	],
});

// propsの変更を監視
watch(
	() => props.stats,
	(newStats) => {
		chartData.value = {
			labels: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
			datasets: [
				{
					label: '現在の能力値',
					data: [
						Math.max(60, newStats.pace || 0),
						Math.max(60, newStats.shooting || 0),
						Math.max(60, newStats.passing || 0),
						Math.max(60, newStats.dribbling || 0),
						Math.max(60, newStats.defending || 0),
						Math.max(60, newStats.physical || 0),
					],
					backgroundColor: 'rgba(59, 130, 246, 0.2)',
					borderColor: 'rgb(59, 130, 246)',
					borderWidth: 2,
				},
			],
		};
	},
	{ deep: true }
);

const chartOptions = {
	scales: {
		r: {
			beginAtZero: false,
			min: 50,
			max: 99,
			ticks: {
				stepSize: 5,
			},
			grid: {
				color: 'rgba(0, 0, 0, 0.1)',
			},
		},
	},
	plugins: {
		legend: {
			display: false,
		},
	},
};
</script>
