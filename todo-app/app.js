/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
console.log("Loading app.js...");
const express = require("express");
var csrf = require("csurf");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh, some secret string!"));
app.use(csrf({ cookie: true })); // ✅ Use this if using cookie-parser (which you are)

const path = require("path");

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

// Assuming you have some database or data store API like this:
// getTodos() -> returns all todos
// createTodo(todo) -> adds a todo

async function seedSampleTodosIfEmpty() {
	const todos = await getTodos();
	if (todos.length === 0) {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		await addTodo({
			title: "Sample overdue todo",
			dueDate: yesterday.toISOString().slice(0, 10),
		});
		await addTodo({
			title: "Sample due today todo",
			dueDate: today.toISOString().slice(0, 10),
		});
		await addTodo({
			title: "Sample due later todo",
			dueDate: tomorrow.toISOString().slice(0, 10),
		});
	}
}

// Call this function in your route handler before rendering
app.get("/", async (req, res) => {
	await seedSampleTodosIfEmpty();
	const allTodos = await getTodos();
	res.render("index", { allTodos });
});

app.get("/", async (request, response) => {
	console.log("GET / route hit");
	const allTodos = await Todo.findAll();

	if (request.accepts("html")) {
		response.render("index", { allTodos, csrfToken: request.csrfToken() });
	} else {
		response.json(allTodos);
	}
});

app.get("/todos", async function (_request, response) {
	console.log("Processing list of all Todos ...");
	// FILL IN YOUR CODE HERE
	try {
		const todos = await Todo.findAll();
		return response.send(todos);
	} catch (error) {
		console.log(error);
		return response.status(422).json(error);
	}
	// First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
	// Then, we have to respond with all Todos, like:
	// response.send(todos)
});

app.get("/todos/:id", async function (request, response) {
	try {
		const todo = await Todo.findByPk(request.params.id);
		return response.json(todo);
	} catch (error) {
		console.log(error);
		return response.status(422).json(error);
	}
});

app.post("/todos", async function (request, response) {
	try {
		todo = await Todo.addTodo(request.body);
		return response.redirect("/");
	} catch (error) {
		console.log(error);
		return response.status(422).json(error);
	}
});

app.put("/todos/:id", async (req, res) => {
	try {
		const todo = await Todo.findByPk(req.params.id);
		if (!todo) return res.status(404).send("Todo not found");

		todo.completed = req.body.completed;
		await todo.save();

		return res.json(todo);
	} catch (error) {
		console.error(error);
		return res.status(422).json(error);
	}
});

app.delete("/todos/:id", async function (request, response) {
	console.log("We have to delete a Todo with ID: ", request.params.id);
	// FILL IN YOUR CODE HERE
	console.log("Deleting a Todo with ID: ", request.params.id);
	try {
		await Todo.removeTodo(request.params.id);
		return response.send(true);
	} catch (error) {
		console.log(error);
		return response.status(422).json(error);
	}
	// First, we have to query our database to delete a Todo by ID.
	// Then, we have to respond back with true/false based on whether the Todo was deleted or not.
	// response.send(true)
});

module.exports = app;
