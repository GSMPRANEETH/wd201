const todoList = require("../todo");

const { all, markAsComplete, add } = todoList();

describe("TodoList Test Suite", () => {
	test("Should add new todo", () => {
		expect(all.length).toBe(0);
		add({ title: "Test todo", dueDate: "2022-12-31", completed: false });
		expect(all.length).toBe(1);
	});

	test("Should mark a todo as complete", () => {
		expect(all[0].completed).toBe(false);
		markAsComplete(0);
		expect(all[0].completed).toBe(true);
	});
});
