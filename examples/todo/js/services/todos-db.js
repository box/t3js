/**
 * @fileoverview A todo object manager with built-in functionality
 * @author Box
 */

/**
 * Todo Object
 * @typedef {Object} Todo
 * @property {number} id A unique identifier
 * @property {string} title A label for the todo
 * @property {boolean} completed Is the task complete?
 */

/*
 * A todo object manager with built-in functionality
 */
Application.addService('todos-db', function() {

	'use strict';

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------
	/** @type {Object} */
	var todos = {};

	/** @type {number} */
	var	counter = 0;

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

	return {

		/**
		 * Returns a Todo by id
		 * @returns {Todo}
		 */
		get: function(id) {
			return todos[id] || null;
		},

		/**
		 * Returns list of all todos
		 * @returns {Todo[]} List of todos
		 */
		getList: function() {
			var todoList = [];

			Object.keys(todos).forEach(function(id) {
				todoList.push(todos[id]);
			});

			return todoList;
		},

		/**
		 * Marks all todos as complete
		 * @returns {void}
		 */
		markAllAsComplete: function() {
			var me = this;
			Object.keys(todos).forEach(function(id) {
				me.markAsComplete(id);
			});
		},

		/**
		 * Marks a todo as completed
		 * @param {number} id The id of the todo
		 * @returns {void}
		 */
		markAsComplete: function(id) {
			if (todos[id]) {
				todos[id].completed = true;
			}
		},

		/**
		 * Marks all todos as incomplete
		 * @returns {void}
		 */
		markAllAsIncomplete: function() {
			var me = this;
			Object.keys(todos).forEach(function(id) {
				me.markAsIncomplete(id);
			});
		},

		/**
		 * Marks a todo as incomplete
		 * @param {number} id The id of the todo
		 * @returns {void}
		 */
		markAsIncomplete: function(id) {
			if (todos[id]) {
				todos[id].completed = false;
			}
		},

		/**
		 * Removes all completed tasks
		 * @returns {void}
		 */
		removeCompleted: function() {
			var me = this;
			Object.keys(todos).forEach(function(id) {
				if (todos[id].completed) {
					me.remove(id);
				}
			});
		},

		/**
		 * Adds a todo
		 * @param {string} title The label of the todo
		 * @returns {number} The id of the new todo
		 */
		add: function(title) {
			var todoId = counter++;
			todos[todoId] = {
				id: todoId,
				title: title,
				completed: false
			};
			return todoId;
		},

		/**
		 * Edits a todo label
		 * @param {number} id The unique identifier of the todo
		 * @param {string} title The new label of the todo
		 * @returns {void}
		 */
		edit: function(id, title) {
			if (todos[id]) {
				todos[id].title = title;
			}
		},

		/**
		 * Removes a todo by id
		 * @param {number} id identifier of Todo to remove
		 * @returns {void}
		 */
		remove: function(id) {
			if (todos[id]) {
				delete todos[id];
			}
		}
	};

});
