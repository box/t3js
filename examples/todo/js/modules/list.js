/**
 * @fileoverview Todo List
 * @author Box
 */

/*
 * Manages the todo list which includes adding/removing/checking items
 */
Application.addModule('list', function(context) {

	'use strict';

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------
	var todosDB,
		moduleEl,
		listEl,
		filter;

	/**
	 * Returns true if all todos in the list are complete
	 * @returns {boolean}
	 * @private
	 */
	function isListCompleted() {
		var todos = todosDB.getList();
		var len = todos.length;
		var isComplete = len > 0;
		for (var i = 0; i < len; i++) {
			if (!todos[i].completed) {
				isComplete = false;
				break;
			}
		}
		return isComplete;
	}

	/**
	 * Sets the todo filter based on URL
	 * @returns {void}
	 * @private
	 */
	function setFilterByUrl(url) {
		if (url.indexOf('/active') > -1) {
			filter = 'incomplete';
		} else if (url.indexOf('/completed') > -1) {
			filter = 'complete';
		} else {
			filter = '';
		}
	}

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

	return {
		/**
		 * The behaviors that this module uses.
		 * @type String[]
		 */
		behaviors: ['todo'],

		/**
		 * The messages that this modules listens for.
		 * @type String[]
		 */
		messages: ['todoadded', 'todoremoved', 'todostatuschange', 'statechanged'],

		/**
		 * Initializes the module. Caches a data store object to todos
		 * @returns {void}
		 */
		init: function() {
			todosDB = context.getService('todos-db');

			moduleEl = context.getElement();
			listEl = moduleEl.querySelector('#todo-list');
		},

		/**
		 * Destroys the module.
		 * @returns {void}
		 */
		destroy: function() {
			listEl = null;
			moduleEl = null;
			todosDB = null;
		},

		/**
		 * Handles all click events for the module.
		 * @param {Event} event A DOM-normalized event object.
		 * @param {HTMLElement} element The nearest HTML element with a data-type
		 *      attribute specified or null if there is none.
		 * @param {string} elementType The value of data-type for the nearest
		 *      element with that attribute specified or null if there is none.
		 * @returns {void}
		 */
		onchange: function(event, element, elementType) {

			if (elementType === 'select-all-checkbox') {
				var shouldMarkAsComplete = element.checked;

				if (shouldMarkAsComplete) {
					todosDB.markAllAsComplete();
				} else {
					todosDB.markAllAsIncomplete();
				}

				this.renderList();

				context.broadcast('todostatuschange');
			}

		},

		/**
		 * Handles all messages received for the module.
		 * @param {string} name The name of the message received.
		 * @param {*} [data] Additional data sent along with the message.
		 * @returns {void}
		 */
		onmessage: function(name, data) {

			switch(name) {
				case 'todoadded':
				case 'todoremoved':
					this.renderList();
					this.updateSelectAllCheckbox();
					break;

				case 'todostatuschange':
					this.updateSelectAllCheckbox();
					break;

				case 'statechanged':
					setFilterByUrl(data.url);
					this.renderList();
					break;
			}

		},

		/**
		 * Creates a list item for a todo based off of a template
		 * @param {number} id The id of the todo
		 * @param {string} title The todo label
		 * @param {boolean} isCompleted Is todo complete
		 * @returns {Node}
		 */
		createTodo: function(id, title, isCompleted) {
			var todoTemplateEl = moduleEl.querySelector('.todo-template-container li'),
				newTodoEl = todoTemplateEl.cloneNode(true);

			// Set the label of the todo
			newTodoEl.querySelector('label').textContent = title;
			newTodoEl.setAttribute('data-todo-id', id);
			if (isCompleted) {
				newTodoEl.classList.add('completed');
				newTodoEl.querySelector('input[type="checkbox"]').checked = true;
			}

			return newTodoEl;
		},

		/**
		 * Appends a new todo list element to the todo-list
		 * @param {number} id The id of the todo
		 * @param {string} title The todo label
		 * @param {boolean} isCompleted Is todo complete
		 * @returns {void}
		 */
		addTodoItem: function(id, title, isCompleted) {
			listEl.appendChild(this.createTodo(id, title, isCompleted));
		},

		/**
		 * Updates the 'checked' status of the select-all checkbox based on the status of the list
		 * @returns {void}
		 */
		updateSelectAllCheckbox: function() {
			var selectAllCheckboxEl = moduleEl.querySelector('#toggle-all');
			selectAllCheckboxEl.checked = isListCompleted();
		},

		/**
		 * Removes all todo elements from the list (not necessarily from the db)
		 * @returns {void}
		 */
		clearList: function() {
			var todoListEl = moduleEl.querySelector('#todo-list');
			while (todoListEl.hasChildNodes()) {
				todoListEl.removeChild(todoListEl.lastChild);
			}
		},

		/**
		 * Renders all todos in the todos db
		 * @returns {void}
		 */
		renderList: function() {
			// Clear the todo list first
			this.clearList();

			var todos = todosDB.getList(),
				todo;

			// Render todos - factor in the current filter as well
			for (var i = 0, len = todos.length; i < len; i++) {
				todo = todos[i];

				if (!filter
						|| (filter === 'incomplete' && !todo.completed)
						|| (filter === 'complete' && todo.completed)) {
					this.addTodoItem(todo.id, todo.title, todo.completed);

				}
			}
		}
	};

});
