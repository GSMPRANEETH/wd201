const todoList = require("../todo");

const { all, markAsComplete, add } = todoList();

function toISOString() {
  return new Date().toISOString().split("T")[0];
}

let today = new Date().toISOString().split("T")[0];

describe("TodoList Test Suite", () => {
  beforeAll(() => {
    add({ title: "Test todo 1", dueDate: "2022-12-31", completed: false });
    add({ title: "Test todo 2", dueDate: today, completed: false });
    add({ title: "Test todo 3", dueDate: "2035-12-31", completed: false });
  });

  test("Should add new todo", () => {
    add({ title: "Test todo 4", dueDate: "2022-12-31", completed: false });
    expect(all.length).toBe(4);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("Should return overdue todos", () => {
    const overdueTodos = all.filter((todo) => todo.dueDate < today);
    expect(overdueTodos.length).toBe(2);
    expect(overdueTodos[0].title).toBe("Test todo 1");
  });

  test("Should return due today todos", () => {
    const dueTodayTodos = all.filter((todo) => todo.dueDate === today);
    expect(dueTodayTodos.length).toBe(1);
    expect(dueTodayTodos[0].title).toBe("Test todo 2");
  });

  test("Should return due later todos", () => {
    const dueLaterTodos = all.filter((todo) => todo.dueDate > today);
    expect(dueLaterTodos.length).toBe(1);
    expect(dueLaterTodos[0].title).toBe("Test todo 3");
  });
});
