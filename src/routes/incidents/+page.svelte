<script lang="ts">
	import { incidentStore, busStore, type Incident, type IncidentType } from '$lib/stores';
	import { onMount } from 'svelte';

	let incidents: Incident[] = [];
	let buses: any[] = [];
	let isAddingIncident = false;
	let searchTerm = '';
	let statusFilter = '';
	let typeFilter: IncidentType | '' = '';

	const incidentTypes: { value: IncidentType; label: string }[] = [
		{ value: 'road-crash', label: 'Road Crash' },
		{ value: 'road-closure', label: 'Road Closure' },
		{ value: 'bus-breakdown', label: 'Bus Breakdown' },
		{ value: 'traffic', label: 'Traffic' },
		{ value: 'weather', label: 'Weather' }
	];

	let newIncident: Omit<Incident, 'id'> = {
		type: 'traffic',
		description: '',
		reportedAt: new Date().toISOString(),
		estimatedDelay: 15,
		affectedBuses: [],
		status: 'active',
		location: ''
	};

	onMount(() => {
		const incidentUnsubscribe = incidentStore.subscribe((value) => {
			incidents = value;
		});

		const busUnsubscribe = busStore.subscribe((value) => {
			buses = value;
		});

		return () => {
			incidentUnsubscribe();
			busUnsubscribe();
		};
	});

	function toggleAddIncident() {
		isAddingIncident = !isAddingIncident;
		
		// Reset form
		if (isAddingIncident) {
			newIncident = {
				type: 'traffic',
				description: '',
				reportedAt: new Date().toISOString(),
				estimatedDelay: 15,
				affectedBuses: [],
				status: 'active',
				location: ''
			};
		}
	}

	function addIncident() {
		incidentStore.add(newIncident);
		isAddingIncident = false;
	}

	function resolveIncident(id: string) {
		if (confirm('Are you sure you want to mark this incident as resolved?')) {
			incidentStore.resolve(id);
		}
	}

	function removeIncident(id: string) {
		if (confirm('Are you sure you want to remove this incident?')) {
			incidentStore.remove(id);
		}
	}
	
	function toggleBus(busId: string) {
		const index = newIncident.affectedBuses.indexOf(busId);
		if (index === -1) {
			newIncident.affectedBuses = [...newIncident.affectedBuses, busId];
		} else {
			newIncident.affectedBuses = newIncident.affectedBuses.filter(id => id !== busId);
		}
	}

	function formatDateTime(dateString: string) {
		return incidentStore.formatReportedAt(dateString);
	}

	$: filteredIncidents = incidents.filter((incident) => {
		const matchesSearch = searchTerm 
			? incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			  (incident.location || '').toLowerCase().includes(searchTerm.toLowerCase())
			: true;
		const matchesStatus = statusFilter 
			? incident.status === statusFilter 
			: true;
		const matchesType = typeFilter
			? incident.type === typeFilter
			: true;
		return matchesSearch && matchesStatus && matchesType;
	});
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1>Incidents</h1>
		<button class="btn btn-primary" on:click={toggleAddIncident}>
			{isAddingIncident ? 'Cancel' : 'Report Incident'}
		</button>
	</div>

	{#if isAddingIncident}
		<div class="card">
			<h2 class="mb-4">Report New Incident</h2>
			<form on:submit|preventDefault={addIncident} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label for="type" class="form-label">Incident Type</label>
						<select id="type" bind:value={newIncident.type} class="form-input" required>
							{#each incidentTypes as type}
								<option value={type.value}>{type.label}</option>
							{/each}
						</select>
					</div>
					<div class="form-control">
						<label for="location" class="form-label">Location</label>
						<input
							id="location"
							type="text"
							bind:value={newIncident.location}
							class="form-input"
							placeholder="e.g. Main Street & Oak Avenue"
						/>
					</div>
					<div class="form-control md:col-span-2">
						<label for="description" class="form-label">Description</label>
						<textarea
							id="description"
							bind:value={newIncident.description}
							class="form-input"
							rows="2"
							placeholder="Describe the incident..."
							required
						></textarea>
					</div>
					<div class="form-control">
						<label for="estimatedDelay" class="form-label">Estimated Delay (minutes)</label>
						<input
							id="estimatedDelay"
							type="number"
							bind:value={newIncident.estimatedDelay}
							min="1"
							max="120"
							class="form-input"
							required
						/>
					</div>
				</div>
				
				<div class="form-control mt-4">
					<label class="form-label">Affected Buses</label>
					<div class="border rounded-md p-4 max-h-60 overflow-y-auto">
						{#if buses.length > 0}
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each buses as bus}
									<label class="flex items-start space-x-2 p-2 border rounded hover:bg-gray-50">
										<input
											type="checkbox"
											checked={newIncident.affectedBuses.includes(bus.id)}
											on:change={() => toggleBus(bus.id)}
											class="mt-1 rounded"
										/>
										<div>
											<div class="font-medium">{bus.id}</div>
											<div class="text-sm text-gray-600">Route: {bus.route.name}</div>
											<div class="text-xs text-gray-500 mt-1">
												{bus.route.schools.join(', ')}
											</div>
										</div>
									</label>
								{/each}
							</div>
						{:else}
							<p class="text-gray-500 text-center py-4">No buses available</p>
						{/if}
					</div>
				</div>
				
				<div class="flex justify-end">
					<button 
						type="submit" 
						class="btn btn-primary"
						disabled={newIncident.affectedBuses.length === 0}
					>
						Report Incident
					</button>
				</div>
			</form>
		</div>
	{:else}
		<div class="card">
			<div class="flex flex-wrap gap-4 mb-4">
				<div class="flex-1 min-w-[15rem]">
					<label for="search" class="form-label">Search</label>
					<input
						id="search"
						type="text"
						bind:value={searchTerm}
						placeholder="Search by description or location..."
						class="form-input"
					/>
				</div>
				<div class="flex-1 min-w-[10rem]">
					<label for="statusFilter" class="form-label">Status</label>
					<select id="statusFilter" bind:value={statusFilter} class="form-input">
						<option value="">All</option>
						<option value="active">Active</option>
						<option value="resolved">Resolved</option>
					</select>
				</div>
				<div class="flex-1 min-w-[10rem]">
					<label for="typeFilter" class="form-label">Type</label>
					<select id="typeFilter" bind:value={typeFilter} class="form-input">
						<option value="">All Types</option>
						{#each incidentTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</select>
				</div>
			</div>
			
			{#if filteredIncidents.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each filteredIncidents as incident}
						<div class={`border rounded-lg overflow-hidden ${incident.status === 'active' ? 'bg-red-50' : 'bg-white'}`}>
							<div class="p-4 border-b bg-white">
								<div class="flex justify-between items-center">
									<h3 class="text-lg font-medium m-0">
										{incidentTypes.find(t => t.value === incident.type)?.label}
									</h3>
									<div>
										{#if incident.status === 'active'}
											<span class="badge badge-error">Active</span>
										{:else}
											<span class="badge">Resolved</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="p-4">
								<p class="mb-3">{incident.description}</p>
								
								<div class="grid grid-cols-2 gap-2 text-sm mb-3">
									<div>
										<p class="text-gray-500">Reported</p>
										<p class="font-medium">{formatDateTime(incident.reportedAt)}</p>
									</div>
									{#if incident.resolvedAt}
										<div>
											<p class="text-gray-500">Resolved</p>
											<p class="font-medium">{formatDateTime(incident.resolvedAt)}</p>
										</div>
									{:else}
										<div>
											<p class="text-gray-500">Estimated Delay</p>
											<p class="font-medium">{incident.estimatedDelay} minutes</p>
										</div>
									{/if}
									{#if incident.location}
										<div>
											<p class="text-gray-500">Location</p>
											<p class="font-medium">{incident.location}</p>
										</div>
									{/if}
								</div>
								
								<div class="mb-3">
									<p class="text-sm text-gray-500 mb-1">Affected Buses</p>
									<div class="flex flex-wrap gap-1">
										{#each incident.affectedBuses as busId}
											<a 
												href={`/buses/${busId}`} 
												class="badge badge-primary hover:underline"
											>
												{busId}
											</a>
										{/each}
									</div>
								</div>
								
								<div class="flex pt-3 border-t">
									<a 
										href={`/incidents/${incident.id}`} 
										class="text-primary hover:underline mr-4"
									>
										Details
									</a>
									{#if incident.status === 'active'}
										<button 
											on:click={() => resolveIncident(incident.id)}
											class="text-accent hover:underline mr-4"
										>
											Resolve
										</button>
									{/if}
									<button 
										on:click={() => removeIncident(incident.id)}
										class="text-error hover:underline"
									>
										Remove
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-8">
					<p class="text-gray-500">No incidents found matching your criteria.</p>
				</div>
			{/if}
		</div>
	{/if}
</div> 