// DOM Elements
const todoList = document.getElementById('todoList');
const newTodoInput = document.getElementById('newTodoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const filterButtons = document.querySelectorAll('.filter-buttons button');

let todos = [];

// Fetch initial todos from JSONPlaceholder
async function fetchTodos() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

// Render todos based on current filter
function renderTodos(filter = 'all') {
    todoList.innerHTML = '';
    
    todos.forEach(todo => {
        if (
            filter === 'all' ||
            (filter === 'completed' && todo.completed) ||
            (filter === 'active' && !todo.completed)
        ) {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.title}</span>
                <button class="delete-btn">Delete</button>
            `;

            // Toggle completion status
            const checkbox = li.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            // Delete todo
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            todoList.appendChild(li);
        }
    });
}

// Add new todo
async function addTodo(title) {
    if (!title.trim()) return;

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST',
            body: JSON.stringify({
                title,
                completed: false,
                userId: 1
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        const newTodo = await response.json();
        todos.unshift({ ...newTodo, id: Date.now() }); // Use timestamp as ID for new todos
        renderTodos();
        newTodoInput.value = '';
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

// Toggle todo completion status
async function toggleTodo(id) {
    try {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                completed: !todo.completed
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        todo.completed = !todo.completed;
        renderTodos();
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

// Delete todo
async function deleteTodo(id) {
    try {
        await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
            method: 'DELETE',
        });

        todos = todos.filter(todo => todo.id !== id);
        renderTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

// Event Listeners
addTodoBtn.addEventListener('click', () => addTodo(newTodoInput.value));

newTodoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo(newTodoInput.value);
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.id === 'showCompletedBtn' ? 'completed' :
                      button.id === 'showActiveBtn' ? 'active' : 'all';
        renderTodos(filter);
    });
});

// Initialize the app
fetchTodos();
