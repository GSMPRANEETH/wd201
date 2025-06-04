const { Op } = require("sequelize");

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
("use strict");
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
		static addTodo({ title, dueDate, userId }) {
			return this.create({ title, dueDate, completed: false, userId });
		}
		static setCompletionStatus() {
			return this.update({ completed: !this.completed });
		}
		static removeTodo(id, userId) {
			return this.destroy({ where: { id: id, userId: userId } });
		}

		static getTodos() {
			return this.findAll();
		}
		static getOverdue(userId) {
			return this.findAll({
				where: {
					dueDate: { [Op.lt]: new Date() },
					completed: false,
					userId,
				},
			});
		}
		static getDueToday(userId) {
			return this.findAll({
				where: {
					dueDate: { [Op.eq]: new Date() },
					completed: false,
					userId,
				},
			});
		}
		static getDueLater(userId) {
			return this.findAll({
				where: {
					dueDate: { [Op.gt]: new Date() },
					completed: false,
					userId,
				},
			});
		}
		static getCompleted(userId) {
			return this.findAll({ where: { completed: true, userId } });
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
