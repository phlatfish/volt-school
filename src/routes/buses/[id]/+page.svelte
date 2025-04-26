<script lang="ts">
	import { busStore, studentStore, incidentStore, type Bus } from '$lib/stores';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let bus: Bus | null = null;
	let students: any[] = [];
	let busIncidents: any[] = [];
	let isEditing = false;
	let editedBus: Bus | null = null;

	const busId = $page.params.id;

	onMount(() => {
		const busUnsubscribe = busStore.subscribe((buses) => {
			bus = buses.find((b) => b.id === busId) || null;
			
			if (bus && isEditing) {
				editedBus = JSON.parse(JSON.stringify(bus)); // Deep copy
			}
		});

		const studentUnsubscribe = studentStore.subscribe((allStudents) => {
			if (bus) {
				students = allStudents.filter((s) => s.busId === bus?.id);
			} else {
				students = [];
			}
		});
		
		const incidentUnsubscribe = incidentStore.subscribe((incidents) => {
			if (bus) {
				busIncidents = incidents.filter(
					(i) => i.affectedBuses.includes(bus?.id || '') && i.status === 'active'
				);
			} else {
				busIncidents = [];
			}
		});

		return () => {
			busUnsubscribe();
			studentUnsubscribe();
			incidentUnsubscribe();
		};
	});

	function toggleEdit() {
		isEditing = !isEditing;
		
		if (isEditing && bus) {
			editedBus = JSON.parse(JSON.stringify(bus)); // Deep copy
		}
	}

	function saveChanges() {
		if (editedBus) {
			busStore.update(busId, editedBus);
			isEditing = false;
		}
	}
	
	function toggleSchool(school: string) {
		if (!editedBus) return;
		
		const index = editedBus.route.schools.indexOf(school as any);
		if (index === -1) {
			editedBus.route.schools = [...editedBus.route.schools, school as any];
		} else {
			editedBus.route.schools = editedBus.route.schools.filter(s => s !== school);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<a href="/buses" class="text-primary hover:underline mb-2 inline-block">
				&larr; Back to Buses
			</a>
			<h1 class="m-0">{bus ? `Bus ${bus.number}` : 'Bus Details'}</h1>
		</div>
		{#if bus}
			<button class="btn btn-primary" on:click={toggleEdit}>
				{isEditing ? 'Cancel' : 'Edit Bus'}
			</button>
		{/if}
	</div>

	{#if bus}
		{#if isEditing && editedBus}
			<div class="card">
				<h2 class="mb-4">Edit Bus</h2>
				<form on:submit|preventDefault={saveChanges} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label for="capacity" class="form-label">Capacity</label>
							<input
								id="capacity"
								type="number"
								bind:value={editedBus.capacity}
								min="1"
								max="100"
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="status" class="form-label">Status</label>
							<select id="status" bind:value={editedBus.status} class="form-input" required>
								<option value="active">Active</option>
								<option value="delayed">Delayed</option>
								<option value="out-of-service">Out of Service</option>
								<option value="inactive">Inactive</option>
							</select>
						</div>
						<div class="form-control">
							<label for="driverName" class="form-label">Driver Name</label>
							<input
								id="driverName"
								type="text"
								bind:value={editedBus.driver.name}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="driverPhone" class="form-label">Driver Phone</label>
							<input
								id="driverPhone"
								type="text"
								bind:value={editedBus.driver.phone}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="routeName" class="form-label">Route Name</label>
							<input
								id="routeName"
								type="text"
								bind:value={editedBus.route.name}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control md:col-span-2">
							<label for="routeDescription" class="form-label">Route Description</label>
							<textarea
								id="routeDescription"
								bind:value={editedBus.route.description}
								class="form-input"
								rows="2"
								required
							></textarea>
						</div>
						<div class="form-control md:col-span-2">
							<label class="form-label">Schools Served</label>
							<div class="flex flex-wrap gap-4 mt-1">
								<label class="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={editedBus.route.schools.includes('Hamilton Primary School')}
										on:change={() => toggleSchool('Hamilton Primary School')}
										class="rounded"
									/>
									<span>Hamilton Primary School</span>
								</label>
								<label class="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={editedBus.route.schools.includes('Van Holten Primary School')}
										on:change={() => toggleSchool('Van Holten Primary School')}
										class="rounded"
									/>
									<span>Van Holten Primary School</span>
								</label>
							</div>
						</div>
					</div>
					<div class="flex justify-end">
						<button 
							type="submit" 
							class="btn btn-primary"
							disabled={editedBus.route.schools.length === 0}
						>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="card">
					<h2>Bus Information</h2>
					<div class="space-y-4 mt-4">
						<div>
							<p class="text-sm text-gray-500">ID</p>
							<p class="font-medium">{bus.id}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Number</p>
							<p class="font-medium">{bus.number}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Capacity</p>
							<p class="font-medium">{bus.capacity} seats</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Status</p>
							<p class="font-medium">
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
						</div>
					</div>
				</div>

				<div class="card">
					<h2>Driver Information</h2>
					<div class="space-y-4 mt-4">
						<div>
							<p class="text-sm text-gray-500">Name</p>
							<p class="font-medium">{bus.driver.name}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Phone</p>
							<p class="font-medium">{bus.driver.phone}</p>
						</div>
					</div>
				</div>

				<div class="card">
					<h2>Route Information</h2>
					<div class="space-y-4 mt-4">
						<div>
							<p class="text-sm text-gray-500">Name</p>
							<p class="font-medium">{bus.route.name}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Description</p>
							<p class="font-medium">{bus.route.description}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Schools</p>
							<div class="flex flex-wrap gap-2 mt-1">
								{#each bus.route.schools as school}
									<span class="badge badge-primary">{school}</span>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<div class="card md:col-span-2">
					<h2>Students on This Bus</h2>
					{#if students.length > 0}
						<div class="overflow-x-auto mt-4">
							<table class="w-full">
								<thead>
									<tr class="border-b">
										<th class="text-left py-2 px-2">ID</th>
										<th class="text-left py-2 px-2">Name</th>
										<th class="text-left py-2 px-2">Grade</th>
										<th class="text-left py-2 px-2">School</th>
										<th class="text-left py-2 px-2">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each students as student}
										<tr class="border-b">
											<td class="py-2 px-2">{student.id}</td>
											<td class="py-2 px-2">{student.firstName} {student.lastName}</td>
											<td class="py-2 px-2">{student.grade}</td>
											<td class="py-2 px-2">{student.school}</td>
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
						<p class="text-gray-500 mt-4">No students assigned to this bus.</p>
					{/if}
				</div>

				<div class="card md:col-span-3">
					<h2>Active Incidents</h2>
					{#if busIncidents.length > 0}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							{#each busIncidents as incident}
								<div class="p-4 bg-red-50 rounded-md border border-red-100">
									<div class="flex justify-between">
										<h3 class="text-lg font-medium">{incident.type.replace('-', ' ')}</h3>
										<span class="text-sm text-gray-500">
											{incidentStore.formatReportedAt(incident.reportedAt)}
										</span>
									</div>
									<p class="mt-2">{incident.description}</p>
									{#if incident.location}
										<p class="text-sm mt-2">
											<span class="font-medium">Location:</span> {incident.location}
										</p>
									{/if}
									<p class="text-sm mt-1">
										<span class="font-medium">Estimated Delay:</span> 
										{incident.estimatedDelay} minutes
									</p>
									<div class="mt-3 pt-2 border-t border-red-200">
										<p class="text-sm font-medium mb-1">Affected Buses:</p>
										<div class="flex flex-wrap gap-2">
											{#each incident.affectedBuses as affectedBusId}
												<span class="badge badge-primary">{affectedBusId}</span>
											{/each}
										</div>
									</div>
									<div class="mt-3">
										<a 
											href={`/incidents/${incident.id}`} 
											class="text-primary hover:underline text-sm"
										>
											View Incident Details
										</a>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-gray-500 mt-4">No active incidents affecting this bus.</p>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<div class="card">
			<p class="text-center py-8 text-gray-500">Bus not found.</p>
		</div>
	{/if}
</div> 