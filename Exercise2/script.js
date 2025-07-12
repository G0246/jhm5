// To-Do List Application with LocalStorage
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    // Initialize DOM elements
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.clearAll = document.getElementById('clearAll');
    }

    // Bind event listeners
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.taskInput.addEventListener('input', () => this.toggleAddButton());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
        this.clearAll.addEventListener('click', () => this.clearAllTasks());
    }

    // Generate unique ID for tasks
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new task
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.toggleAddButton();
        this.render();
        this.showNotification('任務新增成功！');
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
            this.showNotification(task.completed ? '任務已完成！' : '任務標記為待辦');
        }
    }

    // Delete task
    deleteTask(id) {
        if (confirm('您確定要刪除這個任務嗎？')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.showNotification('任務刪除成功！');
        }
    }

    // Edit task
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.showEditModal(task);
    }

    // Show edit modal
    showEditModal(task) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.edit-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <div class="edit-modal-content">
                <h3>編輯任務</h3>
                <input type="text" id="editTaskInput" value="${this.escapeHtml(task.text)}" maxlength="100">
                <div class="edit-modal-actions">
                    <button class="cancel-btn">取消</button>
                    <button class="save-btn">儲存</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const editInput = modal.querySelector('#editTaskInput');
        const saveBtn = modal.querySelector('.save-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        // Focus and select text
        editInput.focus();
        editInput.select();

        // Save task
        const saveTask = () => {
            const newText = editInput.value.trim();
            if (newText && newText !== task.text) {
                task.text = newText;
                task.updatedAt = new Date().toISOString();
                this.saveTasks();
                this.render();
                this.showNotification('任務更新成功！');
            }
            modal.remove();
        };

        // Cancel edit
        const cancelEdit = () => {
            modal.remove();
        };

        // Event listeners
        saveBtn.addEventListener('click', saveTask);
        cancelBtn.addEventListener('click', cancelEdit);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveTask();
            if (e.key === 'Escape') cancelEdit();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cancelEdit();
        });
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    // Get filtered tasks
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    // Clear completed tasks
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('沒有已完成的任務可以清除！');
            return;
        }

        if (confirm(`您確定要刪除 ${completedCount} 個已完成的任務嗎？`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            this.showNotification(`已清除 ${completedCount} 個已完成的任務！`);
        }
    }

    // Clear all tasks
    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showNotification('沒有任務可以清除！');
            return;
        }

        if (confirm(`您確定要刪除全部 ${this.tasks.length} 個任務嗎？`)) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.showNotification('所有任務已清除！');
        }
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '剛才';
        if (minutes < 60) return `${minutes}分鐘前`;
        if (hours < 24) return `${hours}小時前`;
        if (days < 7) return `${days}天前`;

        return date.toLocaleDateString('zh-TW');
    }

    // Create task element
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <span class="task-date">${this.formatDate(task.createdAt)}</span>
            <div class="task-actions">
                <button class="edit-btn">編輯</button>
                <button class="delete-btn">刪除</button>
            </div>
        `;

        // Bind events to task elements
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        return li;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Render tasks
    render() {
        const filteredTasks = this.getFilteredTasks();
        this.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <h3>沒有${this.currentFilter !== 'all' ? this.getFilterName() : ''}任務</h3>
                    <p>${this.getEmptyStateMessage()}</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                this.taskList.appendChild(this.createTaskElement(task));
            });
        }

        this.updateStats();
    }

    // Get filter name in Chinese
    getFilterName() {
        switch (this.currentFilter) {
            case 'completed':
                return '已完成';
            case 'pending':
                return '待辦';
            default:
                return '';
        }
    }

    // Get empty state message
    getEmptyStateMessage() {
        switch (this.currentFilter) {
            case 'completed':
                return '完成一些任務就會顯示在這裡！';
            case 'pending':
                return '所有任務都已完成！做得很好！';
            default:
                return '新增您的第一個任務開始使用！';
        }
    }

    // Update statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
    }

    // Toggle add button state
    toggleAddButton() {
        const hasText = this.taskInput.value.trim().length > 0;
        this.addBtn.disabled = !hasText;
    }

    // Save tasks to LocalStorage
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            this.showNotification('儲存任務時發生錯誤！', 'error');
        }
    }

    // Load tasks from LocalStorage
    loadTasks() {
        try {
            const saved = localStorage.getItem('todoTasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            this.showNotification('載入已儲存任務時發生錯誤！', 'error');
            return [];
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Export tasks as JSON
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'todo-tasks.json';
        link.click();

        URL.revokeObjectURL(url);
        this.showNotification('任務匯出成功！');
    }

    // Import tasks from JSON
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = importedTasks;
                    this.saveTasks();
                    this.render();
                    this.showNotification('任務匯入成功！');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('匯入任務時發生錯誤！', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            window.todoApp.addTask();
        }

        // Escape to clear input
        if (e.key === 'Escape') {
            window.todoApp.taskInput.value = '';
            window.todoApp.toggleAddButton();
        }
    });

    // Add export/import functionality
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '匯出';
    exportBtn.onclick = () => window.todoApp.exportTasks();

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.onchange = (e) => {
        if (e.target.files[0]) {
            window.todoApp.importTasks(e.target.files[0]);
        }
    };

    const importBtn = document.createElement('button');
    importBtn.textContent = '匯入';
    importBtn.onclick = () => importInput.click();

    const actionsDiv = document.querySelector('.actions');
    if (actionsDiv) {
        actionsDiv.appendChild(exportBtn);
        actionsDiv.appendChild(importBtn);
        actionsDiv.appendChild(importInput);
    }
});
