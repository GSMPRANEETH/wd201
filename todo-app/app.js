/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
console.log("Loading app.js...");
const express = require("express");
var csrf = require("csurf");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const saltRounds = 10;

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh, some secret string!"));
app.use(csrf({ cookie: true })); // ✅ Use this if using cookie-parser (which you are)

const path = require("path");
const { ensureLoggedIn } = require("connect-ensure-login");
const { where } = require("sequelize");
const { nextTick } = require("process");

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(
	session({
		secret: "shh, some secret string!",
		cookie: {
			maxAge: 24 * 60 * 60 * 1000,
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		(username, password, done) => {
			User.findOne({ where: { email: username } })
				.then(async (user) => {
					const result = await bcrypt.compare(password, user.password);
					if (result) {
						return done(null, user);
					} else {
						return done("Invalid password");
					}
				})
				.catch((error) => {
					return done(error);
				});
		}
	)
);

passport.serializeUser((user, done) => {
	console.log("serializing user:", user.id);
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findByPk(id)
		.then((user) => {
			done(null, user);
		})
		.catch((error) => {
			done(error, null);
		});
});

app.get("/", async (request, response) => {
	console.log("GET / route hit");

	if (request.accepts("html")) {
		response.render("index", { csrfToken: request.csrfToken() });
	} else {
		response.json(allTodos);
	}
});

app.get(
	"/todos",
	connectEnsureLogin.ensureLoggedIn(),
	async (request, response) => {
		console.log("GET / route hit");
		const loggedInUser = request.user.id;
		const overdue = await Todo.getOverdue(loggedInUser);
		const dueToday = await Todo.getDueToday(loggedInUser);
		const dueLater = await Todo.getDueLater(loggedInUser);
		const completed = await Todo.getCompleted(loggedInUser);
		const sections = [
			{ title: "Overdue", id: "count-overdue", items: overdue },
			{ title: "Due Today", id: "count-due-today", items: dueToday },
			{ title: "Due Later", id: "count-due-later", items: dueLater },
			{ title: "Completed", id: "count-completed", items: completed },
		];
		if (request.accepts("html")) {
			response.render("todos", {
				sections,
				overdue,
				dueToday,
				dueLater,
				completed,
				csrfToken: request.csrfToken(),
			});
		} else {
			response.json(allTodos);
		}
		// First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
		// Then, we have to respond with all Todos, like:
		// response.send(todos)
	}
);

app.get(
	"/todos/:id",
	connectEnsureLogin.ensureLoggedIn(),
	async function (request, response) {
		try {
			const todo = await Todo.findByPk(request.params.id);
			return response.json(todo);
		} catch (error) {
			console.log(error);
			return response.status(422).json(error);
		}
	}
);

app.post(
	"/todos",
	connectEnsureLogin.ensureLoggedIn(),
	async function (request, response) {
		try {
			todo = await Todo.addTodo({
				title: request.body.title,
				dueDate: request.body.dueDate,
				userId: request.user.id,
			});
			return response.redirect("/todos");
		} catch (error) {
			console.log(error);
			return response.status(422).json(error);
		}
	}
);

app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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

app.delete(
	"/todos/:id",
	connectEnsureLogin.ensureLoggedIn(),
	async function (request, response) {
		console.log("We have to delete a Todo with ID: ", request.params.id);
		// FILL IN YOUR CODE HERE
		console.log("Deleting a Todo with ID: ", request.params.id);
		try {
			await Todo.removeTodo(request.params.id, request.user.id);
			return response.send(true);
		} catch (error) {
			console.log(error);
			return response.status(422).json(error);
		}
		// First, we have to query our database to delete a Todo by ID.
		// Then, we have to respond back with true/false based on whether the Todo was deleted or not.
		// response.send(true)
	}
);

app.get("/signup", function (request, response) {
	response.render("signup", { csrfToken: request.csrfToken() });
});

app.post("/users", async function (request, response) {
	const hashedPwd = await bcrypt.hash(request.body.password, 10);
	console.log(hashedPwd);
	try {
		const user = await User.create({
			firstName: request.body.firstName,
			lastName: request.body.lastName,
			email: request.body.email,
			password: hashedPwd,
		});
		request.login(user, (err) => {
			if (err) {
				console.log(err);
			}
			response.redirect("todos");
		});
	} catch {
		console.log(error);
		return response.status(422).json(error);
	}
});

app.get("/login", function (request, response) {
	response.render("login", { csrfToken: request.csrfToken() });
});

app.post(
	"/session",
	passport.authenticate("local", { failureRedirect: "/login" }),
	(request, response) => {
		console.log(request.user);
		response.redirect("/todos");
	}
);

app.get("/signout", (request, response, next) => {
	request.logout((err) => {
		if (err) {
			return next(err);
		}
		response.redirect("/");
	});
});

module.exports = app;
