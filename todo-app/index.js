/* eslint-disable no-unused-vars */
console.log("Loading index.js...");

const { request, response } = require("express");
const express = require("express");
const app = require("./app");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { Todo } = require("./models");

app.get("/todos", function (request, response) {
  Todo.findAll().then(function (todos) {
    response.send(todos);
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
