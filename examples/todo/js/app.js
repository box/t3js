Box.Application.addModule('todo', function(context) {

	var element,
		todoTemplate,
		todoList,
		$,
		$$;

	function setEmptyState() {
		$$('#main').classList.add('hidden');
		$$('#footer').classList.add('hidden');
	}

	function setNonEmptyState() {
		$$('#main').classList.remove('hidden');
		$$('#footer').classList.remove('hidden');
	}

	function updateCounts() {
		var children = todoList.children,
			numCompleted = 0;

		for (var i = 0; i < children.length; i++) {
			if (children[i].classList.contains('completed')) {
				numCompleted++;
			}
		}

		var itemsLeft = children.length - numCompleted;

		$$('#todo-count').innerHTML = '<strong>' + itemsLeft + '</strong> ' + (itemsLeft != 1 ? 'items' : 'item') + ' left';

		if (numCompleted != 0) {
			$$('#clear-completed').innerHTML = 'Clear completed (' + numCompleted + ')';
			$$('#clear-completed').classList.remove('hidden');
		} else {
			$$('#clear-completed').classList.add('hidden');
		}
	}

	return {
		messages: [],

		init: function() {
			element = context.getElement();
			$ = element.querySelectorAll.bind(element);
			$$ = element.querySelector.bind(element);
			todoTemplate = document.querySelector('#templates .todo-template');
			todoList = document.querySelector('#todo-list');
			setEmptyState();
		},

		destroy: function() {
		},

		onmessage: function(name, data) {
		},

		onclick: function(event, element, elementType) {
			if (element) {
				switch(elementType) {
					case 'complete-btn':
						if (element.checked) {
							this.checkTodo(element);
						} else {
							this.uncheckTodo(element);
						}
						break;
					case 'delete-btn':
						this.removeTodo(element);
						break;
					case 'clear-btn':
						this.clearCompleted(element);
						break;
				}

				updateCounts();
			}
		},

		ondblclick: function(event, element, elementType) {
			if (element && elementType == 'todo-label') {
				this.editTodo(element);
			}
		},

		onsubmit: function(event, element, elementType) {
			var form = element,
				input;

			if (element) {
				switch (elementType) {
					case 'new-todo-form':
						input = form.elements['new-todo'];
						this.addTodo(input.value);
						input.value = '';
						updateCounts();
						break;

					case 'edit-form':
						input = form.elements['title'];
						this.modifyTodo(form, input.value);
						break;
				}

				event.preventDefault();
			}
		},

		addTodo: function(text) {
			text = text.trim();

			if (!text) return;

			var node = todoTemplate.cloneNode(true);
			
			node.querySelector('label').innerHTML = text;
			node.querySelector('input.edit').value = text;

			todoList.appendChild(node);

			setNonEmptyState();
		},

		modifyTodo: function(todoEl, text) {
			todoEl.querySelector('label').innerHTML = text;
			todoEl.querySelector('input.edit').value = text;
			jQuery(todoEl).closest('li').removeClass('editing');
		},

		removeTodo: function(element) {
		},

		editTodo: function(element) {
			// find non jQuery way
			jQuery(element).closest('li').addClass('editing');
		},

		checkTodo: function(element) {
			// find non jQuery way
			jQuery(element).closest('li').addClass('completed');
		},

		uncheckTodo: function(element) {
			// find non jQuery way
			jQuery(element).closest('li').removeClass('completed');
		},

		clearCompleted: function() {
			var children = todoList.children,
				nodesToRemove = [];

			for (var i = 0; i < children.length; i++) {
				if (children[i].classList.contains('completed')) {
					nodesToRemove.push(children[i]);
				}
			}

			for (var j = 0; j < nodesToRemove.length; j++) {
				todoList.removeChild(nodesToRemove[j]);
			}
		}
	};
});

