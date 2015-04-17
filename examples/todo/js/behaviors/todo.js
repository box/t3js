/**
 * @fileoverview The TODO item behavior
 * @author Box
 */

/*global Box*/

/*
 * Handles behavior of todo items
 */
Application.addBehavior('todo', function(context) {

	'use strict';

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------

	var ENTER_KEY = 13,
		ESCAPE_KEY = 27;

	var todosDB,
		moduleEl;

	/**
	 * Returns the nearest todo element
	 * @param {HTMLElement} element A root/child node of a todo element to search from
	 * @returns {HTMLElement}
	 * @private
	 */
	function getClosestTodoElement(element) {

		var matchesSelector = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector;

		while (element) {
			if (matchesSelector.bind(element)('li')) {
				return element;
			} else {
				element = element.parentNode;
			}
		}
		return false;

	}

	/**
	 * Returns the id of the nearest todo element
	 * @param {HTMLElement} element A root/child node of a todo element
	 * @returns {string}
	 * @private
	 */
	function getClosestTodoId(element) {
		var todoEl = getClosestTodoElement(element);
		return todoEl.getAttribute('data-todo-id');
	}

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

	return {

		/**
		 * Initializes the module. Caches a data store object to todos
		 * @returns {void}
		 */
		init: function() {
			todosDB = context.getService('todos-db');
			moduleEl = context.getElement();
		},

		/**
		 * Destroys the module.
		 * @returns {void}
		 */
		destroy: function() {
			todosDB = null;
			moduleEl = null;
		},

		/**
		 * Handles all click events for the behavior.
		 * @param {Event} event A DOM-normalized event object.
		 * @param {HTMLElement} element The nearest HTML element with a data-type
		 *      attribute specified or null if there is none.
		 * @param {string} elementType The value of data-type for the nearest
		 *      element with that attribute specified or null if there is none.
		 * @returns {void}
		 */
		onclick: function(event, element, elementType) {

			if (elementType === 'delete-btn') {
				var todoEl = getClosestTodoElement(element),
					todoId = getClosestTodoId(element);

				moduleEl.querySelector('#todo-list').removeChild(todoEl);
				todosDB.remove(todoId);

				context.broadcast('todoremoved', {
					id: todoId
				});

			}

		},

		/**
		 * Handles change events for the behavior.
		 * @param {Event} event A DOM-normalized event object.
		 * @param {HTMLElement} element The nearest HTML element with a data-type
		 *      attribute specified or null if there is none.
		 * @param {string} elementType The value of data-type for the nearest
		 *      element with that attribute specified or null if there is none.
		 * @returns {void}
		 */
		onchange: function(event, element, elementType) {

			if (elementType === 'mark-as-complete-checkbox') {
				var todoEl = getClosestTodoElement(element),
					todoId = getClosestTodoId(element);

				if (element.checked) {
					todoEl.classList.add('completed');
					todosDB.markAsComplete(todoId);
				} else {
					todoEl.classList.remove('completed');
					todosDB.markAsIncomplete(todoId);
				}

				context.broadcast('todostatuschange');

			}

		},

		/**
		 * Handles double click events for the behavior.
		 * @param {Event} event A DOM-normalized event object.
		 * @param {HTMLElement} element The nearest HTML element with a data-type
		 *      attribute specified or null if there is none.
		 * @param {string} elementType The value of data-type for the nearest
		 *      element with that attribute specified or null if there is none.
		 * @returns {void}
		 */
		ondblclick: function(event, element, elementType) {

			if (elementType === 'todo-label') {
				var todoEl = getClosestTodoElement(element);

				event.preventDefault();
				event.stopPropagation();

				this.showEditor(todoEl);
			}

		},

		/**
		 * Handles keydown events for the behavior.
		 * @param {Event} event A DOM-normalized event object.
		 * @param {HTMLElement} element The nearest HTML element with a data-type
		 *      attribute specified or null if there is none.
		 * @param {string} elementType The value of data-type for the nearest
		 *      element with that attribute specified or null if there is none.
		 * @returns {void}
		 */
		onkeydown: function(event, element, elementType) {

			if (elementType === 'edit-input') {
				var todoEl = getClosestTodoElement(element);

				if (event.keyCode === ENTER_KEY) {
					this.saveLabel(todoEl);
					this.hideEditor(todoEl);
				} else if (event.keyCode === ESCAPE_KEY) {
					this.hideEditor(todoEl);
				}

			}

		},

		/**
		 * Displays a input box for the user to edit the label with
		 * @param {HTMLElement} todoEl The todo element to edit
		 * @returns {void}
		 */
		showEditor: function(todoEl) {
			var todoId = getClosestTodoId(todoEl),
				editInputEl = todoEl.querySelector('.edit'),
				title = todosDB.get(todoId).title; // Grab current label

			// Set the edit input value to current label
			editInputEl.value = title;

			todoEl.classList.add('editing');

			// Place user cursor in the input
			editInputEl.focus();
		},

		/**
		 * Hides the edit input for a given todo
		 * @param {HTMLElement} todoEl The todo element
		 * @returns {void}
		 */
		hideEditor: function(todoEl) {
			todoEl.classList.remove('editing');
		},

		/**
		 * Saves the value of the edit input and saves it to the db
		 * @param {HTMLElement} todoEl The todo element to edit
		 * @returns {void}
		 */
		saveLabel: function(todoEl) {
			var todoId = getClosestTodoId(todoEl),
				editInputEl = todoEl.querySelector('.edit'),
				newTitle = (editInputEl.value).trim();

			todoEl.querySelector('label').textContent = newTitle;
			todosDB.edit(todoId, newTitle);
		}
	};

});
