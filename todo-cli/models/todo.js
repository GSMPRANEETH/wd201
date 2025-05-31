// models/todo.js
"use strict";
const { Model, Op } = require("sequelize"); // Add Op here
module.exports = (sequelize, DataTypes) => {
	class Todo extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static async addTask(params) {
			return await Todo.create(params);
		}
		static async showList() {
			console.log("My Todo list \n");

			console.log("Overdue");
			// FILL IN HERE
			const overdueTasks = await Todo.overdue();
			overdueTasks.forEach((task) => {
				console.log(task.displayableString());
			});
			console.log("\n");

			console.log("Due Today");
			// FILL IN HERE
			const todayTasks = await Todo.dueToday();
			todayTasks.forEach((task) => {
				console.log(task.displayableString());
			});
			console.log("\n");

			console.log("Due Later");
			// FILL IN HERE
			const laterTasks = await Todo.dueLater();
			laterTasks.forEach((task) => {
				console.log(task.displayableString());
			});
		}

		static async overdue() {
			// FILL IN HERE TO RETURN OVERDUE ITEMS
			const today = new Date().toISOString().slice(0, 10);
			return await Todo.findAll({
				where: {
					dueDate: { [Op.lt]: today },
				},
				order: [["id", "ASC"]],
			});
		}

		static async dueToday() {
			// FILL IN HERE TO RETURN ITEMS DUE tODAY
			const today = new Date().toISOString().slice(0, 10);
			return await Todo.findAll({
				where: {
					dueDate: today,
				},
				order: [["id", "ASC"]],
			});
		}

		static async dueLater() {
			// FILL IN HERE TO RETURN ITEMS DUE LATER
			const today = new Date().toISOString().slice(0, 10);
			return await Todo.findAll({
				where: {
					dueDate: { [Op.gt]: today },
				},
				order: [["id", "ASC"]],
			});
		}

		static async markAsComplete(id) {
			// FILL IN HERE TO MARK AN ITEM AS COMPLETE
			const todo = await Todo.findByPk(id);
			if (todo) {
				todo.completed = true;
				await todo.save();
			}
			return todo;
		}

		displayableString() {
			let checkbox = this.completed ? "[x]" : "[ ]";
			return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
		}
	}
	Todo.init(
		{
			title: DataTypes.STRING,
			dueDate: DataTypes.DATEONLY,
			completed: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: "Todo",
		}
	);
	return Todo;
};
