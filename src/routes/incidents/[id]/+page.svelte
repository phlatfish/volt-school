<script lang="ts">
	import { incidentStore, busStore, studentStore, type Incident, type IncidentType } from '$lib/stores';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let incident: Incident | null = null;
	let buses: any[] = [];
	let affectedBuses: any[] = [];
	let affectedStudents: any[] = [];
	let isEditing = false;
	let editedIncident: Incident | null = null;

	const incidentId = $page.params.id;

	const incidentTypes: { value: IncidentType; label: string }[] = [
		{ value: 'road-crash', label: 'Road Crash' },
		{ value: 'road-closure', label: 'Road Closure' },
		{ value: 'bus-breakdown', label: 'Bus Breakdown' },
		{ value: 'traffic', label: 'Traffic' },
		{ value: 'weather', label: 'Weather' }
	];

	onMount(() => {
		const incidentUnsubscribe = incidentStore.subscribe((incidents) => {
			incident = incidents.find((i) => i.id === incidentId) || null;
			
			if (incident && isEditing) {
				editedIncident = JSON.parse(JSON.stringify(incident));
			}
		});

		const busUnsubscribe = busStore.subscribe((allBuses) => {
			buses = allBuses;
			
			if (incident) {
				affectedBuses = allBuses.filter((b) => incident?.affectedBuses.includes(b.id));
			}
		});
		
		const studentUnsubscribe = studentStore.subscribe((allStudents) => {
			if (incident) {
				affectedStudents = allStudents.filter(
					(s) => s.busId && incident?.affectedBuses.includes(s.busId)
				);
			} else {
				affectedStudents = [];
			}
		});

		return () => {
			incidentUnsubscribe();
			busUnsubscribe();
			studentUnsubscribe();
		};
	});

	function toggleEdit() {
		isEditing = !isEditing;
		
		if (isEditing && incident) {
			editedIncident = JSON.parse(JSON.stringify(incident));
		}
	}

	function saveChanges() {
		if (editedIncident) {
			incidentStore.update(incidentId, editedIncident);
			isEditing = false;
		}
	}
	
	function resolveIncident() {
		if (confirm('Are you sure you want to mark this incident as resolved?')) {
			incidentStore.resolve(incidentId);
		}
	}
	
	function toggleBus(busId: string) {
		if (!editedIncident) return;
		
		const index = editedIncident.affectedBuses.indexOf(busId);
		if (index === -1) {
			editedIncident.affectedBuses = [...editedIncident.affectedBuses, busId];
		} else {
			editedIncident.affectedBuses = editedIncident.affectedBuses.filter(id => id !== busId);
		}
	}

	function getIncidentTypeName(type: IncidentType): string {
		return incidentTypes.find(t => t.value === type)?.label || type;
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<a href="/incidents" class="text-primary hover:underline mb-2 inline-block">
				&larr; Back to Incidents
			</a>
			<h1 class="m-0">
				{incident ? getIncidentTypeName(incident.type) : 'Incident Details'}
			</h1>
		</div>
		{#if incident}
			<div class="flex space-x-2">
				{#if incident.status === 'active'}
					<button class="btn btn-accent" on:click={resolveIncident}>
						Resolve Incident
					</button>
				{/if}
				<button class="btn btn-primary" on:click={toggleEdit}>
					{isEditing ? 'Cancel' : 'Edit Incident'}
				</button>
			</div>
		{/if}
	</div>

	{#if incident}
		{#if isEditing && editedIncident}
			<div class="card">
				<h2 class="mb-4">Edit Incident</h2>
				<form on:submit|preventDefault={saveChanges} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label for="type" class="form-label">Incident Type</label>
							<select id="type" bind:value={editedIncident.type} class="form-input" required>
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
								bind:value={editedIncident.location}
								class="form-input"
								placeholder="e.g. Main Street & Oak Avenue"
							/>
						</div>
						<div class="form-control md:col-span-2">
							<label for="description" class="form-label">Description</label>
							<textarea
								id="description"
								bind:value={editedIncident.description}
								class="form-input"
								rows="2"
								required
							></textarea>
						</div>
						<div class="form-control">
							<label for="estimatedDelay" class="form-label">Estimated Delay (minutes)</label>
							<input
								id="estimatedDelay"
								type="number"
								bind:value={editedIncident.estimatedDelay}
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
												checked={editedIncident.affectedBuses.includes(bus.id)}
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
							disabled={editedIncident.affectedBuses.length === 0}
						>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="card">
					<h2>Incident Information</h2>
					<div class="space-y-4 mt-4">
						<div>
							<p class="text-sm text-gray-500">ID</p>
							<p class="font-medium">{incident.id}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Type</p>
							<p class="font-medium">{getIncidentTypeName(incident.type)}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Description</p>
							<p class="font-medium">{incident.description}</p>
						</div>
						{#if incident.location}
							<div>
								<p class="text-sm text-gray-500">Location</p>
								<p class="font-medium">{incident.location}</p>
							</div>
						{/if}
						<div>
							<p class="text-sm text-gray-500">Status</p>
							<p class="font-medium">
								{#if incident.status === 'active'}
									<span class="badge badge-error">Active</span>
								{:else}
									<span class="badge">Resolved</span>
								{/if}
							</p>
						</div>
					</div>
				</div>

				<div class="card">
					<h2>Timing Information</h2>
					<div class="space-y-4 mt-4">
						<div>
							<p class="text-sm text-gray-500">Reported At</p>
							<p class="font-medium">{incidentStore.formatReportedAt(incident.reportedAt)}</p>
						</div>
						{#if incident.resolvedAt}
							<div>
								<p class="text-sm text-gray-500">Resolved At</p>
								<p class="font-medium">{incidentStore.formatReportedAt(incident.resolvedAt)}</p>
							</div>
						{:else}
							<div>
								<p class="text-sm text-gray-500">Estimated Delay</p>
								<p class="font-medium">{incident.estimatedDelay} minutes</p>
							</div>
						{/if}
					</div>
				</div>

				<div class="card md:col-span-2">
					<h2>Affected Buses</h2>
					{#if affectedBuses.length > 0}
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
							{#each affectedBuses as bus}
								<div class="border rounded-md p-4">
									<h3 class="text-lg font-medium mb-2">Bus {bus.number}</h3>
									<p class="text-sm text-gray-500">Route</p>
									<p class="font-medium mb-2">{bus.route.name}</p>
									<p class="text-sm text-gray-500">Status</p>
									<p class="font-medium mb-2">
										{#if bus.status === 'active'}
											<span class="badge badge-primary">Active</span>
										{:else if bus.status === 'delayed'}
											<span class="badge badge-error">Delayed</span>
										{:else if bus.status === 'out-of-service'}
											<span class="badge badge-warning">Out of Service</span>
										{:else}
											<span class="badge">{bus.status}</span>
										{/if}
									</p>
									<div class="mt-3">
										<a 
											href={`/buses/${bus.id}`} 
											class="text-primary hover:underline"
										>
											View Bus Details
										</a>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-gray-500 mt-4">No buses affected by this incident.</p>
					{/if}
				</div>

				<div class="card md:col-span-2">
					<h2>Affected Students</h2>
					{#if affectedStudents.length > 0}
						<div class="overflow-x-auto mt-4">
							<table class="w-full">
								<thead>
									<tr class="border-b">
										<th class="text-left py-2 px-2">ID</th>
										<th class="text-left py-2 px-2">Name</th>
										<th class="text-left py-2 px-2">Grade</th>
										<th class="text-left py-2 px-2">School</th>
										<th class="text-left py-2 px-2">Bus</th>
										<th class="text-left py-2 px-2">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each affectedStudents as student}
										<tr class="border-b">
											<td class="py-2 px-2">{student.id}</td>
											<td class="py-2 px-2">{student.firstName} {student.lastName}</td>
											<td class="py-2 px-2">{student.grade}</td>
											<td class="py-2 px-2">{student.school}</td>
											<td class="py-2 px-2">
												<span class="badge badge-primary">{student.busId}</span>
											</td>
											<td class="py-2 px-2">
												<a 
													href={`/students/${student.id}`} 
													class="text-primary hover:underline"
												>
													Details
												</a>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<p class="text-gray-500 mt-4">No students affected by this incident.</p>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<div class="card">
			<p class="text-center py-8 text-gray-500">Incident not found.</p>
		</div>
	{/if}
</div> 