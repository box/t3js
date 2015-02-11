/**
 * @fileoverview Header Module
 * @author Box
 */

/*
 * Handles creation of new todo items
 */
Application.addModule('header', function(context) {

	'use strict';

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------

	var ENTER_KEY = 13;

	var todosDB;

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
		},

		/**
		 * Destroys the module.
		 * @returns {void}
		 */
		destroy: function() {
			todosDB = null;
		},

		/**
		 * Handles the keydown event for the module.
		 * @param {Event} event A DOM-normalized event object.
		 * @param {HTMLElement} element The nearest HTML element with a data-type
		 *      attribute specified or null if there is none.
		 * @param {string} elementType The value of data-type for the nearest
		 *      element with that attribute specified or null if there is none.
		 * @returns {void}
		 */
		onkeydown: function(event, element, elementType) {

			// code to be run when a click occurs
			if (elementType === 'new-todo-input') {

				if (event.keyCode === ENTER_KEY) {

					var todoTitle = (element.value).trim();

					if (todoTitle.length) {
						var newTodoId = todosDB.add(todoTitle);

						context.broadcast('todoadded', {
							id: newTodoId
						});

						// Clear input afterwards
						element.value = '';
					}

					event.preventDefault();
					event.stopPropagation();
				}

			}

		}
	};

});
