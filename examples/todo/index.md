---
title: T3 JavaScript Framework - Todo.js Example
permalink: /examples/todo/
todolink: /examples/todo/
---

<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title>T3 • TodoNotMVC</title>
		<link rel="stylesheet" href="bower_components/todomvc-common/base.css">
		<link rel="stylesheet" href="css/app.css">
	</head>
	<body>
		<section id="todoapp" class="module" data-module="page">
			<header id="header" class="module" data-module="header">
				<h1>todos</h1>
				<form data-type="new-todo-form">
					<input id="new-todo" data-type="new-todo-input" name="new-todo" placeholder="What needs to be done?" autofocus  autocomplete="off">
				</form>
			</header>
			<section id="main" class="module" data-module="list">
				<input id="toggle-all" data-type="select-all-checkbox" type="checkbox">
				<label for="toggle-all">Mark all as complete</label>
				<ul id="todo-list">
				</ul>
				<ul class="todo-template-container" style="display: none">
					<li>
						<div class="view">
							<input class="toggle" type="checkbox" data-type="mark-as-complete-checkbox">
							<label data-type="todo-label"></label>
							<button class="destroy" data-type="delete-btn"></button>
						</div>
						<input class="edit" data-type="edit-input" value="a">
					</li>
				</ul>
			</section>
			<footer id="footer" class="module" data-module="footer">
				<span id="todo-count"><strong class="items-left-counter">0</strong> <span class="items-left-text">items left</span></span>
				<ul id="filters">
					<li>
						<a class="selected" href="{{ site.baseurl }}{{ page.todolink }}">All</a>
					</li>
					<li>
						<a href="{{ site.baseurl }}{{ page.todolink }}active/">Active</a>
					</li>
					<li>
						<a href="{{ site.baseurl }}{{ page.todolink }}completed/">Completed</a>
					</li>
				</ul>
				<button id="clear-completed" data-type="clear-btn">Clear completed (<span class="completed-count">1</span>)</button>
			</footer>
		</section>
		<footer id="info">
			<p>Double-click to edit a todo</p>
			<p>Created by <a href="http://github.com/box">Box</a></p>
			<p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
		</footer>
		<ul id="templates" style="display:none">
			<li class="completed">
				<div class="view">
					<input class="toggle" type="checkbox" checked>
					<label>Create a TodoMVC template</label>
					<button class="destroy"></button>
				</div>
			</li>
			<li class="todo-template">
				<form data-type="edit-form">
					<div class="view">
						<input class="toggle" type="checkbox" data-type="complete-btn">
						<label data-type="todo-label"></label>
						<button class="destroy" data-type="destroy-btn"></button>
					</div>
					<input class="edit" name="title">
				</form>
			</li>
		</ul>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
		<script src="bower_components/todomvc-common/base.js"></script>
		<script type="text/javascript" src="{{ site.baseurl }}/js/t3-0.1.1.js"></script>
		<script type="text/javascript" src="js/app.js"></script>
		<script type="text/javascript" src="js/services/todos-db.js"></script>
		<script type="text/javascript" src="js/services/router.js"></script>
		<script type="text/javascript" src="js/behaviors/todo.js"></script>
		<script type="text/javascript" src="js/modules/header.js"></script>
		<script type="text/javascript" src="js/modules/footer.js"></script>
		<script type="text/javascript" src="js/modules/list.js"></script>
		<script type="text/javascript" src="js/modules/page.js"></script>
		<script>
			Application.init({
				debug: true
			});
		</script>
	</body>
</html>
