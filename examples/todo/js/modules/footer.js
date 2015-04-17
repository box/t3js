/**
 * @fileoverview Footer Module
 * @author Box
 */

/*
 * Manages the footer module, including todo counts and filters
 */
Application.addModule('footer', function(context) {

	'use strict';

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------

	var todosDB,
		moduleEl;

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

	return {

		messages: ['todoadded', 'todoremoved', 'todostatuschange', 'statechanged'],

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
			moduleEl = null;
			todosDB = null;
		},

		/**
		 * Handles the click event for the module.
		 * @param {Event} event A DOM-normalized event object.
		 * @param {HTMLElement} element The nearest HTML element with a data-type
		 *      attribute specified or null if there is none.
		 * @param {string} elementType The value of data-type for the nearest
		 *      element with that attribute specified or null if there is none.
		 * @returns {void}
		 */
		onclick: function(event, element, elementType) {

			// code to be run when a click occurs
			if (elementType === 'clear-btn') {
				this.clearCompletedTodos();
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
				case 'todostatuschange':
					this.updateTodoCounts();
					break;

				case 'statechanged':
					this.updateSelectedFilterByUrl(data.url);
					break;
			}
		},

		/**
		 * Updates the selected class on the filter links
		 * @param {string} url The current url
		 * @returns {void}
		 */
		updateSelectedFilterByUrl: function(url) {
			var linkEls = moduleEl.querySelectorAll('a');

			for (var i = 0, len = linkEls.length; i < len; i++) {
				if (url === linkEls[i].pathname) {
					linkEls[i].classList.add('selected');
				} else {
					linkEls[i].classList.remove('selected');
				}
			}
		},


		/**
		 * Updates todo counts based on what is in the todo DB
		 * @returns {void}
		 */
		updateTodoCounts: function() {
			var todos = todosDB.getList();

			var completedCount = 0;
			for (var i = 0, len = todos.length; i < len; i++) {
				if (todos[i].completed) {
					completedCount++;
				}
			}

			var itemsLeft = todos.length - completedCount;

			this.updateItemsLeft(itemsLeft);
			this.updateCompletedButton(completedCount);

		},

		/**
		 * Updates the displayed count of incomplete tasks
		 * @param {number} itemsLeft # of incomplete tasks
		 * @returns {void}
		 */
		updateItemsLeft: function(itemsLeft) {
			var itemText = itemsLeft === 1 ? 'item' : 'items';

			moduleEl.querySelector('.items-left-counter').textContent = itemsLeft;
			moduleEl.querySelector('.items-left-text').textContent = itemText + ' left';
		},

		/**
		 * Updates the displayed count of completed tasks and hide/shows the button accordingly
		 * @param {number} completedCount # of completed tasks
		 * @returns {void}
		 */
		updateCompletedButton: function(completedCount) {
			if (completedCount > 0) {
				moduleEl.querySelector('.completed-count').textContent = completedCount;
				moduleEl.classList.add('has-completed-tasks');
			} else {
				moduleEl.classList.remove('has-completed-tasks');
			}
		},

		/**
		 * Removes any todos that have been completed
		 * @returns {void}
		 */
		clearCompletedTodos: function() {
			todosDB.removeCompleted();
			context.broadcast('todoremoved');
		}

	};

});
