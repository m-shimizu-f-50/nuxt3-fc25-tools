<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

const useError = () => {
	const error = ref({
		statusCode: 404,
		statusMessage: 'Page Not Found',
	});
	return error;
};

// エラーを取得
const error = useError();
</script>
<template>
	<div>
		<NuxtLayout>
			<div class="mx-auto max-w-[800px] space-y-4 p-4">
				<div v-if="error">
					<img
						src="/images/error.png"
						alt=""
						width="240"
						height="240"
						class="mx-auto"
					/>
					<div class="space-y-2">
						<p class="text-center font-bold leading-none opacity-70">
							N° {{ error.statusCode }}
						</p>
						<p class="text-center text-2xl font-bold leading-none">
							{{ error.statusMessage }}
						</p>
					</div>
				</div>
				<div class="flex items-center justify-center pb-4">
					<NuxtLink
						to="/"
						class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition"
					>
						<Icon
							icon="mynaui:x"
							class="h-6 w-6 text-white"
							width="24"
							height="24"
						/>
					</NuxtLink>
				</div>
			</div>
		</NuxtLayout>
	</div>
</template>
