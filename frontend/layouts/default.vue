<script setup lang="ts">
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
</script>

<template>
	<div class="flex flex-col min-h-screen bg-gray-100">
		<!-- ヘッダー -->
		<Header />

		<!-- メインコンテンツ -->
		<main class="flex-1 container mx-auto mt-20">
			<slot />
		</main>

		<!-- フッター -->
		<Footer />
	</div>
</template>
