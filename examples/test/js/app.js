Box.Application.addModule('todo', function(context) {

	var $ = document.querySelectorAll.bind(document),
		$$ = document.querySelector.bind(document);

	var todoTemplate = $$('#templates .todo-template'),
		todoList = $$('#todo-list');

	function setEmptyState() {
		$$('#main').classList.add('hidden');
		$$('#footer').classList.add('hidden');
	}

	function setNonEmptyState() {
		$$('#main').classList.remove('hidden');
		$$('#footer').classList.remove('hidden');
	}

	return {
		messages: [],

		init: function() {
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
				}
			}
		},

		ondblclick: function(event, element, elementType) {
			if (element && elementType == 'todo-label') {
				this.editTodo(element);
			}
		},

		onsubmit: function(event, element, elementType) {
			if (element && elementType == 'new-todo-form') {
				event.preventDefault();

				var form = element,
					input = form.elements['new-todo'];

				this.addTodo(input.value);

				input.value = '';
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

	};
});

Box.Application.init({
	debug: true
});
