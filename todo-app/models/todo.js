/* eslint-disable no-unused-vars */
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Todo extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Todo.belongsTo(models.User, { foreignKey: "userId" });
		}
		static addTodo({ title, dueDate }) {
			return this.create({ title, dueDate, completed: false });
		}
		setCompletionStatus() {
			return this.update({ completed: !this.completed });
		}
		static removeTodo(id) {
			return this.destroy({ where: { id } });
		}
		static getTodos() {
			return this.findAll();
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
