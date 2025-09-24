/**
 * Combined TicTacToe Game and Todo List Cloudflare Worker
 * Serves static files and handles Todo API routes
 */

interface TodoTask {
	id: number;
	text: string;
	completed: boolean;
	isEditing: boolean;
	createdAt: string; // ISO timestamp
}

interface TodoData {
	tasks: TodoTask[];
	taskIdCounter: number;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Handle API routes for Todo List
		if (url.pathname.startsWith('/api/')) {
			return handleApiRequest(request, env);
		}

		// Serve static assets
		try {
			const asset = await env.ASSETS.fetch(new Request(url, request));
			return asset;
		} catch (error) {
			// If asset not found, return 404
			return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;

	// Add CORS headers for all API requests
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};

	// Handle preflight requests
	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		switch (path) {
			case '/api/tasks':
				if (request.method === 'GET') {
					return await getTasks(env, corsHeaders);
				} else if (request.method === 'POST') {
					return await createTask(request, env, corsHeaders);
				}
				break;

			case '/api/tasks/bulk':
				if (request.method === 'PUT') {
					return await updateTasks(request, env, corsHeaders);
				}
				break;

			default:
				if (path.startsWith('/api/tasks/') && request.method === 'PUT') {
					const taskId = parseInt(path.split('/').pop() || '0');
					return await updateTask(request, env, corsHeaders, taskId);
				} else if (path.startsWith('/api/tasks/') && request.method === 'DELETE') {
					const taskId = parseInt(path.split('/').pop() || '0');
					return await deleteTask(env, corsHeaders, taskId);
				}
				break;
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	} catch (error) {
		console.error('API Error:', error);
		return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
	}
}

async function getTasks(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const userData = await env.TODO_KV.get('user_tasks');
	const data: TodoData = userData ? JSON.parse(userData) : { tasks: [], taskIdCounter: 1 };

	return new Response(JSON.stringify(data), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

async function createTask(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const { text } = await request.json() as { text: string };

	if (!text || text.trim() === '') {
		return new Response(JSON.stringify({ error: 'Task text is required' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	const userData = await env.TODO_KV.get('user_tasks');
	const data: TodoData = userData ? JSON.parse(userData) : { tasks: [], taskIdCounter: 1 };

	const newTask: TodoTask = {
		id: data.taskIdCounter++,
		text: text.trim(),
		completed: false,
		isEditing: false,
		createdAt: new Date().toISOString()
	};

	data.tasks.push(newTask);
	await env.TODO_KV.put('user_tasks', JSON.stringify(data));

	return new Response(JSON.stringify(newTask), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

async function updateTask(request: Request, env: Env, corsHeaders: Record<string, string>, taskId: number): Promise<Response> {
	const updateData = await request.json() as Partial<TodoTask>;

	const userData = await env.TODO_KV.get('user_tasks');
	const data: TodoData = userData ? JSON.parse(userData) : { tasks: [], taskIdCounter: 1 };

	const taskIndex = data.tasks.findIndex(task => task.id === taskId);
	if (taskIndex === -1) {
		return new Response(JSON.stringify({ error: 'Task not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updateData };
	await env.TODO_KV.put('user_tasks', JSON.stringify(data));

	return new Response(JSON.stringify(data.tasks[taskIndex]), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

async function deleteTask(env: Env, corsHeaders: Record<string, string>, taskId: number): Promise<Response> {
	const userData = await env.TODO_KV.get('user_tasks');
	const data: TodoData = userData ? JSON.parse(userData) : { tasks: [], taskIdCounter: 1 };

	const taskIndex = data.tasks.findIndex(task => task.id === taskId);
	if (taskIndex === -1) {
		return new Response(JSON.stringify({ error: 'Task not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}

	data.tasks.splice(taskIndex, 1);
	await env.TODO_KV.put('user_tasks', JSON.stringify(data));

	return new Response(JSON.stringify({ success: true }), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

async function updateTasks(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const { tasks } = await request.json() as { tasks: TodoTask[] };

	const userData = await env.TODO_KV.get('user_tasks');
	const data: TodoData = userData ? JSON.parse(userData) : { tasks: [], taskIdCounter: 1 };

	data.tasks = tasks;
	await env.TODO_KV.put('user_tasks', JSON.stringify(data));

	return new Response(JSON.stringify({ success: true }), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}
