<script lang="ts">
	import { busStore, incidentStore, type Bus } from '$lib/stores';
	import { onMount } from 'svelte';

	let buses: Bus[] = [];
	let incidents: any[] = [];
	let isAddingBus = false;
	let searchTerm = '';
	let statusFilter = '';

	let newBus: Omit<Bus, 'id'> = {
		number: '', 
		capacity: 48,
		driver: {
			name: '',
			phone: ''
		},
		route: {
			name: '',
			description: '',
			schools: []
		},
		status: 'active'
	};

	onMount(() => {
		const busUnsubscribe = busStore.subscribe((value) => {
			buses = value;
		});

		const incidentUnsubscribe = incidentStore.subscribe((value) => {
			incidents = value;
		});

		return () => {
			busUnsubscribe();
			incidentUnsubscribe();
		};
	});

	function toggleAddBus() {
		isAddingBus = !isAddingBus;
		
		if (isAddingBus) {
			newBus = {
				number: '', 
				capacity: 48,
				driver: {
					name: '',
					phone: ''
				},
				route: {
					name: '',
					description: '',
					schools: []
				},
				status: 'active'
			};
		}
	}

	function addBus() {
		try {
			if (!newBus.number.trim()) {
				throw new Error('Bus identifier is required');
			}
			
			newBus.number = newBus.number.trim();
			
			busStore.add(newBus);
			isAddingBus = false;
		} catch (error) {
			alert(error.message);
		}
	}

	function removeBus(id: string) {
		if (confirm('Are you sure you want to remove this bus?')) {
			busStore.remove(id);
		}
	}
	
	function toggleSchool(school: string) {
		const index = newBus.route.schools.indexOf(school as any);
		if (index === -1) {
			newBus.route.schools = [...newBus.route.schools, school as any];
		} else {
			newBus.route.schools = newBus.route.schools.filter(s => s !== school);
		}
	}

	function getBusIncidents(busId: string) {
		return incidents.filter(
			incident => incident.affectedBuses.includes(busId) && incident.status === 'active'
		);
	}

	$: filteredBuses = buses.filter((bus) => {
		const matchesSearch = searchTerm 
			? bus.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
			  bus.route.name.toLowerCase().includes(searchTerm.toLowerCase())
			: true;
		const matchesStatus = statusFilter 
			? bus.status === statusFilter 
			: true;
		return matchesSearch && matchesStatus;
	});
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1>Buses</h1>
		<button class="btn btn-primary" on:click={toggleAddBus}>
			{isAddingBus ? 'Cancel' : 'Add Bus'}
		</button>
	</div>

	{#if isAddingBus}
		<div class="card">
			<h2 class="mb-4">Add New Bus</h2>
			<form on:submit|preventDefault={addBus} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label for="busNumber" class="form-label">Bus Identifier</label>
						<input
							id="busNumber"
							type="text"
							bind:value={newBus.number}
							class="form-input"
							placeholder="Enter bus identifier (e.g., B-101, A12)"
							required
						/>
						<p class="text-sm text-gray-500 mt-1">
							Enter a unique identifier for the bus
						</p>
					</div>
					<div class="form-control">
						<label for="capacity" class="form-label">Capacity</label>
						<input
							id="capacity"
							type="number"
							bind:value={newBus.capacity}
							min="1"
							max="100"
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="driverName" class="form-label">Driver Name</label>
						<input
							id="driverName"
							type="text"
							bind:value={newBus.driver.name}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="driverPhone" class="form-label">Driver Phone</label>
						<input
							id="driverPhone"
							type="text"
							bind:value={newBus.driver.phone}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="routeName" class="form-label">Route Name</label>
						<input
							id="routeName"
							type="text"
							bind:value={newBus.route.name}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control md:col-span-2">
						<label for="routeDescription" class="form-label">Route Description</label>
						<textarea
							id="routeDescription"
							bind:value={newBus.route.description}
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
									checked={newBus.route.schools.includes('Hamilton Primary School')}
									on:change={() => toggleSchool('Hamilton Primary School')}
									class="rounded"
								/>
								<span>Hamilton Primary School</span>
							</label>
							<label class="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={newBus.route.schools.includes('Van Holten Primary School')}
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
						disabled={newBus.route.schools.length === 0}
					>
						Add Bus
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
						placeholder="Search by number or route..."
						class="form-input"
					/>
				</div>
				<div class="flex-1 min-w-[15rem]">
					<label for="statusFilter" class="form-label">Filter by Status</label>
					<select id="statusFilter" bind:value={statusFilter} class="form-input">
						<option value="">All Statuses</option>
						<option value="active">Active</option>
						<option value="delayed">Delayed</option>
						<option value="out-of-service">Out of Service</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>
			</div>
			
			{#if filteredBuses.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each filteredBuses as bus}
						<div class="border rounded-lg overflow-hidden bg-white">
							<div class="p-4 border-b bg-gray-50">
								<div class="flex justify-between items-center">
									<h3 class="text-lg font-medium m-0">Bus {bus.number}</h3>
									<div>
										{#if bus.status === 'active'}
											<span class="badge badge-primary">Active</span>
										{:else if bus.status === 'delayed'}
											<span class="badge badge-error">Delayed</span>
										{:else if bus.status === 'out-of-service'}
											<span class="badge badge-warning">Out of Service</span>
										{:else}
											<span class="badge">{bus.status}</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="p-4">
								<p class="text-sm text-gray-500 mb-1">Route</p>
								<p class="font-medium mb-2">{bus.route.name}</p>
								
								<p class="text-sm text-gray-500 mb-1">Schools</p>
								<div class="flex flex-wrap gap-2 mb-2">
									{#each bus.route.schools as school}
										<span class="badge badge-primary">{school.replace('Primary School', '')}</span>
									{/each}
								</div>
								
								<p class="text-sm text-gray-500 mb-1">Driver</p>
								<p class="font-medium mb-2">{bus.driver.name}</p>
								
								<p class="text-sm text-gray-500 mb-1">Capacity</p>
								<p class="font-medium mb-3">{bus.capacity} seats</p>
								
								{#if getBusIncidents(bus.id).length > 0}
									<div class="mt-4">
										<p class="text-sm font-medium text-error mb-1">Active Incidents</p>
										{#each getBusIncidents(bus.id) as incident}
											<p class="text-sm text-gray-700">
												{incident.type.replace('-', ' ')} - {incident.estimatedDelay} min delay
											</p>
										{/each}
									</div>
								{/if}
								
								<div class="flex mt-4 pt-3 border-t">
									<a 
										href={`/buses/${bus.id}`} 
										class="text-primary hover:underline mr-4"
									>
										Details
									</a>
									<button 
										on:click={() => removeBus(bus.id)}
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
					<p class="text-gray-500">No buses found matching your criteria.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
