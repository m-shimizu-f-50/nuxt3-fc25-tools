<template>
	<header class="bg-gray-300 text-white p-4 shadow-md fixed top-0 w-full z-50">
		<div class="container mx-auto flex justify-between items-center">
			<NuxtLink to="/" class="text-xl font-bold">FC25</NuxtLink>
			<nav>
				<ul class="flex">
					<li>
						<NuxtLink to="/tournaments" class="p-5 hover:bg-gray-400 transition"
							>CF対戦データ</NuxtLink
						>
					</li>
					<li>
						<NuxtLink to="/evolutions" class="p-5 hover:bg-gray-400 transition"
							>EVO</NuxtLink
						>
					</li>
				</ul>
			</nav>
		</div>
	</header>
</template>
