<script>
	import { studentStore, busStore, incidentStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const schoolInfo = [
		{
			name: 'Hamilton Primary School',
			address: '9 Hamilton Ln, Basking Ridge, NJ 07920',
			phone: '(908) 575-0050',
			principal: 'Timothy Beaumont'
		},
		{
			name: 'Van Holten Primary School',
			address: '360 Van Holten Rd, Bridgewater, NJ 08807',
			phone: '(908) 231-1220',
			principal: 'George Rauh'
		}
	];

	function resetAllData() {
		if (confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
			studentStore.reset();
			busStore.reset();
			incidentStore.reset();
			alert('All data has been reset.');
			window.location.reload();
		}
	}

	// Track sync status
	let syncStatus = 'initializing';
	let students = [];
	let buses = [];
	let incidents = [];
	let activeIncidents = [];

	$: stats = [
		{ title: 'Total Students', value: students.length, icon: '👨‍🎓' },
		{ title: 'Total Buses', value: buses.length, icon: '🚌' },
		{ title: 'Active Incidents', value: activeIncidents.length, icon: '⚠️' }
	];

	$: schoolStudentCounts = {
		'Hamilton Primary School': students.filter(s => s.school === 'Hamilton Primary School').length,
		'Van Holten Primary School': students.filter(s => s.school === 'Van Holten Primary School').length
	};

	onMount(() => {
		const studentsUnsubscribe = studentStore.subscribe(data => {
			students = data;
			updateSyncStatus();
		});

		const busesUnsubscribe = busStore.subscribe(data => {
			buses = data;
			updateSyncStatus();
		});

		const incidentsUnsubscribe = incidentStore.subscribe(data => {
			incidents = data;
			activeIncidents = incidents.filter(i => i.status === 'active');
			updateSyncStatus();
		});

		setTimeout(() => {
			if (syncStatus === 'initializing') {
				syncStatus = 'ready';
			}
		}, 2000);

		return () => {
			studentsUnsubscribe();
			busesUnsubscribe();
			incidentsUnsubscribe();
		};
	});

	function updateSyncStatus() {
		syncStatus = 'ready';
	}

	function formatDateTime(isoString) {
		if (!isoString) return '';
		const date = new Date(isoString);
		return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="space-y-8">
	<section>
		<div class="flex justify-between items-center">
			<h1>Dashboard</h1>
			<div class="flex items-center space-x-4">
				<div class="flex items-center text-sm">
					<span class="mr-2">Data Sync:</span>
					{#if syncStatus === 'initializing'}
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
							<span class="mr-1">●</span> Initializing...
						</span>
					{:else if syncStatus === 'ready'}
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
							<span class="mr-1">●</span> Synced
						</span>
					{:else if syncStatus === 'error'}
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
							<span class="mr-1">●</span> Sync Error
						</span>
					{/if}
				</div>
				<button 
					class="btn btn-error btn-sm" 
					on:click={resetAllData}
				>
					Reset All Data
				</button>
			</div>
		</div>
		<p class="text-gray-600 mb-6">Welcome to the Voltschool Student Information System.</p>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each stats as stat}
				<div class="card flex items-center">
					<div class="text-3xl mr-4">{stat.icon}</div>
					<div>
						<h3 class="font-bold text-2xl m-0">{stat.value}</h3>
						<p class="text-gray-600 text-sm">{stat.title}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="flex items-center">
			<span>Active Incidents</span>
			<a href="/incidents" class="ml-auto text-sm text-primary hover:underline">View All</a>
		</h2>
		
		{#if activeIncidents.length > 0}
			<div class="card">
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<th class="text-left pb-2">Type</th>
							<th class="text-left pb-2">Time</th>
							<th class="text-left pb-2">Status</th>
							<th class="text-left pb-2">Affected Buses</th>
						</tr>
					</thead>
					<tbody>
						{#each activeIncidents as incident}
							<tr class="border-b last:border-0">
								<td class="py-3">{incident.type}</td>
								<td class="py-3">{formatDateTime(incident.reportedAt)}</td>
								<td class="py-3">
									<span class="badge badge-error">Active</span>
								</td>
								<td class="py-3">
									{#each incident.affectedBuses as bus}
										<span class="badge badge-primary mr-1">{bus}</span>
									{/each}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="card text-center py-8">
				<p class="text-gray-500">No active incidents at this time.</p>
			</div>
		{/if}
	</section>

	<section>
		<h2>Schools</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each schoolInfo as school}
				<div class="card">
					<h3 class="mb-2">{school.name}</h3>
					<p class="text-gray-600 text-sm mb-4">{school.address}</p>
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<p class="font-medium">Principal:</p>
							<p>{school.principal}</p>
						</div>
						<div>
							<p class="font-medium">Phone:</p>
							<p>{school.phone}</p>
						</div>
						<div>
							<p class="font-medium">Students:</p>
							<p>{schoolStudentCounts[school.name] || 0}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
