document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const getTasksBtn = document.getElementById('getTasksBtn');
    const createTaskBtn = document.getElementById('create');

    // Axios instance for making requests
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:3000'  //backend URL
    });

    // Handle task form submission
    createTaskBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const scheduledTime = document.getElementById('scheduledTime').value;
        const email = document.getElementById('email').value;

        try {
            // Make POST request to create a task
            const response = await axiosInstance.post('/tasks', {
                title,
                description,
                scheduledTime,
                email
            });

            alert('Task Created!');
            taskForm.reset(); // Reset the form after task creation
        } catch (error) {
            console.error('Error creating task:', error.message);
        }
    });

    // Handle fetching all tasks
    getTasksBtn.addEventListener('click', async () => {
        try {
            // Make GET request to fetch all tasks
            const response = await axiosInstance.get('/tasks');
            const tasks = response.data;

            // Clear the task list
            taskList.innerHTML = '';

            // Render tasks
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `${task.title} - ${task.scheduledTime} (${task.email})`;
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
        }
    });
});
