# Simple To-Do List Application

A clean, responsive to-do list application built with vanilla HTML, CSS, and JavaScript. Features full CRUD operations, local storage persistence, and bulk actions.

## 🚀 Features

- ✅ **Add Tasks** - Create new tasks with input validation
- 📝 **Edit Tasks** - Inline editing with save/cancel options
- 👁️ **View Tasks** - Clean, organized task display
- 🗑️ **Delete Tasks** - Remove individual tasks with confirmation
- ✔️ **Complete Tasks** - Mark tasks as done with visual feedback
- 🧹 **Bulk Actions** - Remove completed tasks or all tasks at once
- 💾 **Local Storage** - Automatic data persistence between sessions
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 📁 File Structure

```
Exercise2/
├── index.html          # Main HTML structure and layout
├── css/
│   └── styles.css      # Complete styling and responsive design
├── js/
│   └── main.js         # Application logic and functionality
└── README.md           # This documentation file
```

## 📄 File Descriptions

### `index.html`
The main HTML file that provides the structure and layout for the application.

**Key Elements:**
- **Container**: Main wrapper with centered layout
- **Input Section**: Text input and "Add Task" button
- **Task List**: Dynamic `<ul>` element where tasks are rendered
- **Bulk Actions**: Container for "Remove Completed" and "Remove All" buttons
- **Empty State**: Message displayed when no tasks exist

**External Dependencies:**
- Links to `css/styles.css` for styling
- Links to `js/main.js` for functionality

### `css/styles.css`
Comprehensive stylesheet providing modern, responsive design.

**Key Style Sections:**
- **Reset Styles**: Removes default browser styling
- **Container Layout**: Centers content with card-like appearance
- **Input Styling**: Modern form controls with focus states
- **Task Styling**: Clean task items with hover effects
- **Button Styling**: Consistent button design with color coding
- **Responsive Design**: Mobile-first approach with media queries
- **Bulk Actions**: Styling for bulk operation buttons

**Color Scheme:**
- Primary Blue: `#3498db` (Add button, Save button)
- Success Green: `#27ae60` (Complete button)
- Warning Orange: `#f39c12` (Edit button, Remove Completed)
- Danger Red: `#e74c3c` (Delete button, Remove All)
- Neutral Gray: `#95a5a6` (Cancel button, disabled states)

### `js/main.js`
The core application logic implemented as a JavaScript class with comprehensive functionality.

## 🔧 JavaScript Documentation

### Class: `TodoApp`

The main application class that manages all to-do list functionality.

#### Constructor
```javascript
constructor()
```
Initializes the application by setting up empty task array, task ID counter, and calling the init method.

#### Core Methods

##### `init()`
**Purpose**: Initializes the application by setting up DOM references and event listeners.

**Functionality:**
- Gets references to all necessary DOM elements
- Binds event listeners for user interactions
- Loads saved tasks from localStorage
- Renders the initial UI state

**DOM Elements Referenced:**
- `taskInput`: Text input for new tasks
- `addBtn`: Button to add new tasks
- `taskList`: Container for task items
- `emptyState`: Message shown when no tasks exist
- `bulkActions`: Container for bulk action buttons
- `removeCompletedBtn`: Button to remove completed tasks
- `removeAllBtn`: Button to remove all tasks

**Event Listeners:**
- Click on Add button
- Enter key press in task input
- Click on Remove Completed button
- Click on Remove All button

##### `addTask()`
**Purpose**: Creates and adds a new task to the list.

**Process:**
1. Gets and trims the input text
2. Validates that text is not empty
3. Creates new task object with unique ID
4. Adds task to the tasks array
5. Clears input field
6. Saves to localStorage
7. Re-renders the UI

**Task Object Structure:**
```javascript
{
    id: number,           // Unique identifier
    text: string,         // Task description
    completed: boolean,   // Completion status
    isEditing: boolean    // Edit mode status
}
```

##### `deleteTask(taskId)`
**Purpose**: Removes a specific task from the list.

**Parameters:**
- `taskId` (number): The unique ID of the task to delete

**Process:**
1. Shows confirmation dialog
2. If confirmed, filters out the task from array
3. Saves updated array to localStorage
4. Re-renders the UI

##### `toggleComplete(taskId)`
**Purpose**: Toggles the completion status of a task.

**Parameters:**
- `taskId` (number): The unique ID of the task to toggle

**Process:**
1. Finds the task by ID
2. Inverts the completed boolean value
3. Saves to localStorage
4. Re-renders the UI

**Visual Effect**: Completed tasks get strikethrough text styling.

##### `startEdit(taskId)`
**Purpose**: Puts a task into edit mode for inline editing.

**Parameters:**
- `taskId` (number): The unique ID of the task to edit

**Process:**
1. Finds the target task
2. Sets all other tasks to non-editing mode
3. Sets target task to editing mode
4. Re-renders the UI
5. Focuses and selects the edit input text

**Note**: Only one task can be in edit mode at a time.

##### `saveEdit(taskId, newText)`
**Purpose**: Saves changes made during task editing.

**Parameters:**
- `taskId` (number): The unique ID of the task being edited
- `newText` (string): The new text content for the task

**Process:**
1. Finds the task by ID
2. Validates that new text is not empty
3. Updates task text and exits edit mode
4. Saves to localStorage
5. Re-renders the UI

**Validation**: Prevents saving empty tasks with alert message.

##### `cancelEdit(taskId)`
**Purpose**: Cancels editing and reverts to view mode without saving changes.

**Parameters:**
- `taskId` (number): The unique ID of the task being edited

**Process:**
1. Finds the task by ID
2. Sets editing mode to false
3. Re-renders the UI (original text is restored)

##### `removeCompleted()`
**Purpose**: Removes all completed tasks at once.

**Process:**
1. Counts completed tasks
2. Shows alert if no completed tasks exist
3. Shows confirmation with count of tasks to be removed
4. If confirmed, filters out completed tasks
5. Saves to localStorage
6. Re-renders the UI

**User Feedback**: Dynamic confirmation message with proper pluralization.

##### `removeAll()`
**Purpose**: Removes all tasks (completed and uncompleted).

**Process:**
1. Checks if any tasks exist
2. Shows alert if no tasks exist
3. Shows confirmation with total count and warning
4. If confirmed, empties the tasks array
5. Saves to localStorage
6. Re-renders the UI

**Safety Feature**: Includes "cannot be undone" warning in confirmation.

##### `render()`
**Purpose**: Updates the entire UI based on current application state.

**Process:**
1. Clears the task list container
2. Checks if tasks array is empty
3. Shows/hides empty state and bulk actions accordingly
4. Updates bulk action button states
5. Creates and appends task elements for each task

**UI State Management:**
- Shows empty state when no tasks exist
- Hides bulk actions when no tasks exist
- Disables "Remove Completed" when no completed tasks exist

##### `createTaskElement(task)`
**Purpose**: Creates a DOM element for a single task.

**Parameters:**
- `task` (object): The task object to create an element for

**Returns**: HTML `<li>` element with task content and controls

**Two Rendering Modes:**

1. **Edit Mode** (`task.isEditing = true`):
   - Text input with current task text
   - Save and Cancel buttons
   - Input has maxlength attribute for validation

2. **View Mode** (`task.isEditing = false`):
   - Span with task text (strikethrough if completed)
   - Complete/Undo button (text changes based on status)
   - Edit button (disabled if task is completed)
   - Delete button

**Button Actions**: Uses inline onclick handlers that call todoApp methods.

#### Storage Methods

##### `saveTasks()`
**Purpose**: Persists current tasks array to browser's localStorage.

**Implementation:**
```javascript
localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
```

**Storage Format**: JSON string representation of the tasks array.

##### `loadTasks()`
**Purpose**: Retrieves saved tasks from localStorage on application startup.

**Process:**
1. Attempts to get 'todoTasks' from localStorage
2. If data exists, parses JSON and restores tasks array
3. Updates taskIdCounter to prevent ID conflicts
4. Sets counter to one more than the highest existing task ID

**Error Handling**: Gracefully handles missing localStorage data.

#### Application Initialization

##### Global Variable and Event Listener
```javascript
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});
```

**Purpose**: Creates global todoApp instance after DOM is fully loaded.

**Why Global**: Allows inline onclick handlers in dynamically created HTML to access the app instance.

## 🎨 User Interface Features

### Responsive Design
- **Desktop**: Side-by-side layout for task content and buttons
- **Mobile**: Stacked layout with full-width buttons
- **Tablet**: Adaptive layout based on screen size

### Visual Feedback
- **Hover Effects**: Buttons and task items respond to mouse hover
- **Focus States**: Input fields show focus with color changes
- **Disabled States**: Buttons are visually disabled when not applicable
- **Completion Status**: Strikethrough text for completed tasks

### User Experience
- **Keyboard Support**: Enter key adds new tasks
- **Auto-focus**: Edit inputs automatically receive focus
- **Text Selection**: Edit mode selects all text for easy replacement
- **Confirmation Dialogs**: Prevent accidental deletions
- **Smart Button States**: Bulk action buttons respond to current state

## 💾 Data Persistence

### localStorage Implementation
- **Automatic Saving**: Every modification triggers save to localStorage
- **Session Persistence**: Data survives browser close/reopen
- **No Server Required**: Fully client-side data storage
- **JSON Format**: Human-readable data structure

### Data Structure
```javascript
// Example localStorage content
[
    {
        "id": 1,
        "text": "Complete project documentation",
        "completed": false,
        "isEditing": false
    },
    {
        "id": 2,
        "text": "Review code changes",
        "completed": true,
        "isEditing": false
    }
]
```

## 🚀 Getting Started

1. **Open the Application**: Open `index.html` in any modern web browser
2. **Add Tasks**: Type in the input field and click "Add Task" or press Enter
3. **Manage Tasks**: Use the buttons next to each task to complete, edit, or delete
4. **Bulk Operations**: Use the buttons below the task list for bulk actions
5. **Automatic Saving**: Your tasks are automatically saved and will persist between sessions

## 🌟 Technical Highlights

- **Vanilla JavaScript**: No external libraries or frameworks required
- **ES6 Classes**: Modern JavaScript class-based architecture
- **Event-Driven**: Responsive to user interactions
- **Modular Design**: Clear separation of concerns
- **Robust Error Handling**: Graceful handling of edge cases
- **Performance Optimized**: Efficient DOM manipulation and rendering
- **Accessibility Focused**: Semantic HTML and keyboard navigation support

## 🔧 Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES6 support required)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Features Used**: localStorage, ES6 classes, arrow functions, template literals

## 📝 License

This project is created for educational purposes and is free to use and modify.
