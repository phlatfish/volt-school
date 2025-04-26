<script>
	import '../app.css';
</script>

<div class="min-h-screen flex flex-col">
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-between items-center">
				<div class="flex items-center">
					<img 
						src="/voltschool.png" 
						alt="Voltschool Logo" 
						class="h-8 w-auto mr-3"
					/>
					<h1 class="text-2xl font-bold text-primary m-0">Voltschool</h1>
					<span class="ml-2 text-sm text-gray-500">District Code: 572394</span>
				</div>
				<nav>
					<ul class="flex space-x-6">
						<li><a href="/" class="text-gray-700 hover:text-primary">Dashboard</a></li>
						<li><a href="/students" class="text-gray-700 hover:text-primary">Students</a></li>
						<li><a href="/buses" class="text-gray-700 hover:text-primary">Buses</a></li>
						<li><a href="/incidents" class="text-gray-700 hover:text-primary">Incidents</a></li>
					</ul>
				</nav>
			</div>
		</div>
	</header>

	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<slot />
	</main>
</div>