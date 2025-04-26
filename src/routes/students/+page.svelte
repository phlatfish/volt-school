<script lang="ts">
	import { studentStore, busStore, type Student } from '$lib/stores';
	import { onMount } from 'svelte';

	let students: Student[] = [];
	let buses: any[] = [];
	let isAddingStudent = false;
	let searchTerm = '';
	let selectedSchool = '';

	let newStudent: Omit<Student, 'id'> = {
		firstName: '',
		lastName: '',
		grade: '',
		school: 'Hamilton Primary School',
		busId: null,
		address: '',
		guardian: {
			name: '',
			phone: '',
			email: ''
		}
	};

	onMount(() => {
		const unsubscribe = studentStore.subscribe((value) => {
			students = value;
		});

		const busUnsubscribe = busStore.subscribe((value) => {
			buses = value;
		});

		return () => {
			unsubscribe();
			busUnsubscribe();
		};
	});

	function toggleAddStudent() {
		isAddingStudent = !isAddingStudent;
		
		// Reset form
		if (isAddingStudent) {
			newStudent = {
				firstName: '',
				lastName: '',
				grade: '',
				school: 'Hamilton Primary School',
				busId: null,
				address: '',
				guardian: {
					name: '',
					phone: '',
					email: ''
				}
			};
		}
	}

	function addStudent() {
		studentStore.add(newStudent);
		isAddingStudent = false;
	}

	function removeStudent(id: string) {
		if (confirm('Are you sure you want to remove this student?')) {
			studentStore.remove(id);
		}
	}

	$: filteredStudents = students.filter((student) => {
		const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
		const matchesSearch = searchTerm 
			? fullName.includes(searchTerm.toLowerCase()) 
			: true;
		const matchesSchool = selectedSchool 
			? student.school === selectedSchool 
			: true;
		return matchesSearch && matchesSchool;
	});

	$: availableBuses = buses.filter(bus => 
		bus.route.schools.includes(newStudent.school)
	);
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1>Students</h1>
		<button class="btn btn-primary" on:click={toggleAddStudent}>
			{isAddingStudent ? 'Cancel' : 'Add Student'}
		</button>
	</div>

	{#if isAddingStudent}
		<div class="card">
			<h2 class="mb-4">Add New Student</h2>
			<form on:submit|preventDefault={addStudent} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="form-control">
						<label for="firstName" class="form-label">First Name</label>
						<input
							id="firstName"
							type="text"
							bind:value={newStudent.firstName}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="lastName" class="form-label">Last Name</label>
						<input
							id="lastName"
							type="text"
							bind:value={newStudent.lastName}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="grade" class="form-label">Grade</label>
						<select id="grade" bind:value={newStudent.grade} class="form-input" required>
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
						<select id="school" bind:value={newStudent.school} class="form-input" required>
							<option value="Hamilton Primary School">Hamilton Primary School</option>
							<option value="Van Holten Primary School">Van Holten Primary School</option>
						</select>
					</div>
					<div class="form-control">
						<label for="bus" class="form-label">Bus</label>
						<select id="bus" bind:value={newStudent.busId} class="form-input">
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
							bind:value={newStudent.address}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="guardianName" class="form-label">Guardian Name</label>
						<input
							id="guardianName"
							type="text"
							bind:value={newStudent.guardian.name}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="guardianPhone" class="form-label">Guardian Phone</label>
						<input
							id="guardianPhone"
							type="text"
							bind:value={newStudent.guardian.phone}
							class="form-input"
							required
						/>
					</div>
					<div class="form-control">
						<label for="guardianEmail" class="form-label">Guardian Email</label>
						<input
							id="guardianEmail"
							type="email"
							bind:value={newStudent.guardian.email}
							class="form-input"
							required
						/>
					</div>
				</div>
				<div class="flex justify-end">
					<button type="submit" class="btn btn-primary">Add Student</button>
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
						placeholder="Search by name..."
						class="form-input"
					/>
				</div>
				<div class="flex-1 min-w-[15rem]">
					<label for="schoolFilter" class="form-label">Filter by School</label>
					<select id="schoolFilter" bind:value={selectedSchool} class="form-input">
						<option value="">All Schools</option>
						<option value="Hamilton Primary School">Hamilton Primary School</option>
						<option value="Van Holten Primary School">Van Holten Primary School</option>
					</select>
				</div>
			</div>
			
			{#if filteredStudents.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b">
								<th class="text-left p-2">ID</th>
								<th class="text-left p-2">Name</th>
								<th class="text-left p-2">Grade</th>
								<th class="text-left p-2">School</th>
								<th class="text-left p-2">Bus</th>
								<th class="text-left p-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredStudents as student}
								<tr class="border-b">
									<td class="p-2">{student.id}</td>
									<td class="p-2">{student.firstName} {student.lastName}</td>
									<td class="p-2">{student.grade}</td>
									<td class="p-2">{student.school}</td>
									<td class="p-2">
										{#if student.busId}
											<span class="badge badge-primary">{student.busId}</span>
										{:else}
											<span class="text-gray-400">No bus assigned</span>
										{/if}
									</td>
									<td class="p-2">
										<div class="flex space-x-2">
											<a 
												href={`/students/${student.id}`} 
												class="text-primary hover:underline"
											>
												Details
											</a>
											<button 
												on:click={() => removeStudent(student.id)}
												class="text-error hover:underline"
											>
												Remove
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-center py-8">
					<p class="text-gray-500">No students found matching your criteria.</p>
				</div>
			{/if}
		</div>
	{/if}
</div> 