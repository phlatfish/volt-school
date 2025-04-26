<script lang="ts">
	import { studentStore, busStore, incidentStore, type Student } from '$lib/stores';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let student: Student | null = null;
	let studentBus: any = null;
	let buses: any[] = [];
	let busIncidents: any[] = [];
	let isEditing = false;
	let editedStudent: Student | null = null;

	const studentId = $page.params.id;

	onMount(() => {
		const studentUnsubscribe = studentStore.subscribe((students) => {
			student = students.find((s) => s.id === studentId) || null;
			
			if (student && isEditing) {
				editedStudent = { ...student };
			}
		});

		const busUnsubscribe = busStore.subscribe((allBuses) => {
			buses = allBuses;
			
			if (student?.busId) {
				studentBus = allBuses.find((b) => b.id === student?.busId) || null;
			}
		});
		
		const incidentUnsubscribe = incidentStore.subscribe((incidents) => {
			if (student?.busId) {
				busIncidents = incidents.filter(
					(i) => i.affectedBuses.includes(student?.busId || '') && i.status === 'active'
				);
			} else {
				busIncidents = [];
			}
		});

		return () => {
			studentUnsubscribe();
			busUnsubscribe();
			incidentUnsubscribe();
		};
	});

	function toggleEdit() {
		isEditing = !isEditing;
		
		if (isEditing && student) {
			editedStudent = { ...student };
		}
	}

	function saveChanges() {
		if (editedStudent) {
			studentStore.update(studentId, editedStudent);
			isEditing = false;
		}
	}

	$: availableBuses = student ? buses.filter(bus => 
		bus.route.schools.includes(student.school)
	) : [];
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<a href="/students" class="text-primary hover:underline mb-2 inline-block">
				&larr; Back to Students
			</a>
			<h1 class="m-0">{student ? `${student.firstName} ${student.lastName}` : 'Student Details'}</h1>
		</div>
		{#if student}
			<button class="btn btn-primary" on:click={toggleEdit}>
				{isEditing ? 'Cancel' : 'Edit Student'}
			</button>
		{/if}
	</div>

	{#if student}
		{#if isEditing && editedStudent}
			<div class="card">
				<h2 class="mb-4">Edit Student</h2>
				<form on:submit|preventDefault={saveChanges} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label for="firstName" class="form-label">First Name</label>
							<input
								id="firstName"
								type="text"
								bind:value={editedStudent.firstName}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="lastName" class="form-label">Last Name</label>
							<input
								id="lastName"
								type="text"
								bind:value={editedStudent.lastName}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="grade" class="form-label">Grade</label>
							<select id="grade" bind:value={editedStudent.grade} class="form-input" required>
								<option value="">Select Grade</option>
								<option value="K">Kindergarten</option>
								<option value="1">1st Grade</option>
								<option value="2">2nd Grade</option>
								<option value="3">3rd Grade</option>
								<option value="4">4th Grade</option>
								<option value="5">5th Grade</option>
							</select>
						</div>
						<div class="form-control">
							<label for="school" class="form-label">School</label>
							<select id="school" bind:value={editedStudent.school} class="form-input" required>
								<option value="Hamilton Primary School">Hamilton Primary School</option>
								<option value="Van Holten Primary School">Van Holten Primary School</option>
							</select>
						</div>
						<div class="form-control">
							<label for="bus" class="form-label">Bus</label>
							<select id="bus" bind:value={editedStudent.busId} class="form-input">
								<option value={null}>No Bus Assigned</option>
								{#each availableBuses as bus}
									<option value={bus.id}>{bus.number} - {bus.route.name}</option>
								{/each}
							</select>
						</div>
						<div class="form-control">
							<label for="address" class="form-label">Address</label>
							<input
								id="address"
								type="text"
								bind:value={editedStudent.address}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="guardianName" class="form-label">Guardian Name</label>
							<input
								id="guardianName"
								type="text"
								bind:value={editedStudent.guardian.name}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="guardianPhone" class="form-label">Guardian Phone</label>
							<input
								id="guardianPhone"
								type="text"
								bind:value={editedStudent.guardian.phone}
								class="form-input"
								required
							/>
						</div>
						<div class="form-control">
							<label for="guardianEmail" class="form-label">Guardian Email</label>
							<input
								id="guardianEmail"
								type="email"
								bind:value={editedStudent.guardian.email}
								class="form-input"
								required
							/>
						</div>
					</div>
					<div class="flex justify-end">
						<button type="submit" class="btn btn-primary">Save Changes</button>
					</div>
				</form>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="card">
					<h2>Student Information</h2>
					<div class="space-y-4 mt-4">
						<div>
							<p class="text-sm text-gray-500">ID</p>
							<p class="font-medium">{student.id}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Name</p>
							<p class="font-medium">{student.firstName} {student.lastName}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Grade</p>
							<p class="font-medium">{student.grade}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">School</p>
							<p class="font-medium">{student.school}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Address</p>
							<p class="font-medium">{student.address}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Student Code</p>
							<p class="font-mono">{student.studentCode}</p>
						</div>
					</div>
				</div>

				<div class="card">
					<h2>Guardian Information</h2>
					<div class="space-y-4 mt-4">
						<div>
							<p class="text-sm text-gray-500">Name</p>
							<p class="font-medium">{student.guardian.name}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Phone</p>
							<p class="font-medium">{student.guardian.phone}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Email</p>
							<p class="font-medium">{student.guardian.email}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Guardian Code</p>
							<p class="font-mono">{student.guardian.guardianCode}</p>
						</div>
					</div>
				</div>

				<div class="card md:col-span-2">
					<h2>Transportation</h2>
					{#if student.busId && studentBus}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
							<div>
								<h3 class="text-lg font-medium">Bus Information</h3>
								<div class="space-y-2 mt-2">
									<div>
										<p class="text-sm text-gray-500">Bus Number</p>
										<p class="font-medium">{studentBus.number}</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Route</p>
										<p class="font-medium">{studentBus.route.name}</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Driver</p>
										<p class="font-medium">{studentBus.driver.name}</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Status</p>
										<p class="font-medium">
											{#if studentBus.status === 'active'}
												<span class="badge badge-primary">Active</span>
											{:else if studentBus.status === 'delayed'}
												<span class="badge badge-error">Delayed</span>
											{:else if studentBus.status === 'out-of-service'}
												<span class="badge badge-warning">Out of Service</span>
											{:else}
												<span class="badge">{studentBus.status}</span>
											{/if}
										</p>
									</div>
								</div>
							</div>

							<div>
								<h3 class="text-lg font-medium">Active Incidents</h3>
								{#if busIncidents.length > 0}
									<div class="space-y-3 mt-2">
										{#each busIncidents as incident}
											<div class="p-3 bg-red-50 rounded-md border border-red-100">
												<div class="flex justify-between">
													<span class="font-medium">{incident.type.replace('-', ' ')}</span>
													<span class="text-sm text-gray-500">
														{incidentStore.formatReportedAt(incident.reportedAt)}
													</span>
												</div>
												<p class="text-sm mt-1">{incident.description}</p>
												<p class="text-sm mt-1">
													<span class="font-medium">Estimated Delay:</span> 
													{incident.estimatedDelay} minutes
												</p>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-gray-500 mt-2">No active incidents for this bus.</p>
								{/if}
							</div>
						</div>
					{:else}
						<p class="text-gray-500 mt-2">No bus assigned to this student.</p>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<div class="card">
			<p class="text-center py-8 text-gray-500">Student not found.</p>
		</div>
	{/if}
</div>