# Combined Tic Tac Toe Game and Todo List

This Cloudflare Worker serves both a Tic Tac Toe game and a Todo List application.

## Features

### Tic Tac Toe Game
- Single player mode (vs AI)
- Two player mode
- Located at `/` (root)

### Todo List
- Full CRUD operations for tasks
- Task completion tracking
- Task editing capabilities
- Bulk operations (remove completed, remove all)
- Persistent storage using Cloudflare KV
- Located at `/todo-list/`

## Project Structure

```
public/
├── index.html          # Tic Tac Toe game
├── script.js           # Tic Tac Toe game logic
├── styles.css          # Tic Tac Toe styles
└── todo-list/          # Todo List application
    ├── index.html      # Todo List UI
    ├── script.js       # Todo List logic
    └── styles.css      # Todo List styles

src/
└── index.ts            # Combined worker with API routes

wrangler.jsonc          # Cloudflare configuration with KV binding
```

## Development

```bash
npm run dev         # Start development server
npm run deploy      # Deploy to Cloudflare
npx wrangler types  # Regenerate types after config changes
```

## API Endpoints

The todo list uses the following API endpoints:

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a specific task
- `DELETE /api/tasks/:id` - Delete a specific task
- `PUT /api/tasks/bulk` - Bulk update tasks

## Navigation

- From Tic Tac Toe → Todo List: Click "📝 To-Do List" link
- From Todo List → Tic Tac Toe: Click "← Back to Tic Tac Toe" link