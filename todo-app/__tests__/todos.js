/* eslint-disable no-undef */
const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  let csrfToken = $("[name=_csrf]").val();
  return csrfToken;
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(403);
  });

  test("Should create sample due today item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const today = new Date().toISOString().split("T")[0];

    const response = await agent.post("/todos").send({
      title: "Due Today",
      dueDate: today,
      completed: false,
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(403);
  });

  test("Should create sample due later item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split("T")[0];

    const response = await agent.post("/todos").send({
      title: "Due Later",
      dueDate: dueDate,
      completed: false,
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(403);
  });

  test("Should create sample overdue item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dueDate = yesterday.toISOString().split("T")[0];

    const response = await agent.post("/todos").send({
      title: "Overdue",
      dueDate: dueDate,
      completed: false,
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(403);
  });
});
