$(window).on("load", (ev) => {
	$(window).on("beforeunload", (ev) => {
		ev.preventDefault(); // prompt before exiting page
	});
});

const tasks = [];
let taskIdx = 0;

let activeSearch = "";

// * Returns a task with a matching name
function findTask(name)
{
	return tasks.find((val) => val.title == name);
}

// * Returns a task's index by name
function findTaskIdx(name)
{
	for(let i = 0; i < tasks.length; i++)
	{
		if(tasks[i].title == name)
			return i;
	}

	return -1;
}

// * Returns the last visible task, starting from idx
function lastVisibleTask(idx)
{
	for(let i = idx - 1; i >= 0; i--)
	{
		if(tasks[i].displayed)
			return tasks[i];
	}

	return null;
}

// * Hides or shows a task
function showTask(idx, show)
{
	const task = tasks[idx];

	if(show && !task.displayed)
	{
		task.displayed = true;

		const last = lastVisibleTask(idx);
		if(last)
			last.element.after(task.element);
		else
			$("#taskContainer").prepend(task.element);
	}
	else if(!show && task.displayed)
	{
		task.displayed = false;
		task.element.detach();
	}
}

// * Filter all tasks by their name and tags
function filterTasks()
{
	activeSearch = activeSearch.trim();

	if(activeSearch == "")
	{
		for(let i = 0; i < tasks.length; i++)
		{
			if(activeTags.length > 0)
				showTask(i, taskHasTags(tasks[i], activeTags));
			else
				showTask(i, true);
		}
	}
	else
	{
		for(let i = 0; i < tasks.length; i++)
		{
			const task = tasks[i];

			if(task.title.indexOf(activeSearch) >= 0)
			{
				if(activeTags.length > 0)
					showTask(i, taskHasTags(task, activeTags));
				else
					showTask(i, true);
			}
			else
				showTask(i, false);
		}
	}
}

// * Creates a new task and returns it
function createTask(title, desc = "", checked = false, tags = [])
{
	if(findTask(title))
		return null;

	// todo: create tag elements when loading

	const task = $("#tmpTask").clone().attr("id", `task${taskIdx}`);
	const taskObj = {element: task, title: title, desc: desc, checked: checked, displayed: true, tags: tags};

	$("[x-title]", task).text(title);

	taskIdx++;
	$("#taskContainer").append(task);

	if(tags.length > 0)
	{
		tags.forEach((tagName, idx) => {
			const tag = findTag(tagName);

			if(!tag)
			{
				tags.splice(idx, 1);
				return;
			}

			const label = createTagLabel(tag);
			$("[x-tag-div]", task).append(label);
		});
	}

	task.on("click", (ev2) => {
		activeTask = taskObj;
		activeTaskModal.removeClass("hidden");
		$("[x-header]", activeTaskModal).text(title);
		$("#currTaskTitle").val(activeTask.title);
		$("#currTaskDesc").val(activeTask.desc);

		let tagDiv = $("[x-tag-div]", activeTaskModal);
		tagDiv.html("");

		if(taskObj.tags.length > 0)
		{
			taskObj.tags.forEach((tagName, idx) => {
				const tag = findTag(tagName);

				if(!tag)
				{
					taskObj.tags.splice(idx, 1);
					return;
				}

				const entry = $("#tmpTagList").clone().removeAttr("id");
				$("[x-title]", entry).addClass(tagColors[tag.color]).text(tag.title);
				entry.addClass("mb-2");

				$("[x-add]", entry).remove();
				tagDiv.append(entry);

				$("[x-delete]", entry).on("click", (ev3) => {
					entry.remove();
					taskObj.tags.splice(idx, 1);
					$(`[x-tag-idx="${tag.idx}"]`, task).remove();

					if(taskObj.tags.length <= 0)
						tagDiv.text("Aucune étiquette...");
				});
			});
		}
		else
			tagDiv.text("Aucune étiquette...");
	});

	$(task).on("click", "[x-check], [x-tag-div] *", (ev2) => { ev2.stopPropagation(); });
	$(task).on("mouseenter", "[x-check], [x-tag-div] *", (ev2) => { task.addClass("no-select"); });
	$(task).on("mouseleave", "[x-check], [x-tag-div] *", (ev2) => { task.removeClass("no-select"); });

	$("[x-check]", task).on("change", (ev2) => {
		taskObj.checked = ev2.target.checked;

		if(taskObj.checked)
		{
			$("[x-title]", task).addClass("td-thru");
			task.addClass("btn-dark").removeClass("btn-secondary");
		}
		else
		{
			$("[x-title]", task).removeClass("td-thru");
			task.removeClass("btn-dark").addClass("btn-secondary");
		}
	});

	if(checked)
	{
		$("[x-check]", task)[0].checked = true;
		$("[x-check]", task).trigger("change");
	}

	if(tasks.length > 0)
		tasks[tasks.length - 1].element.addClass("mb-2");

	tasks.push(taskObj);

	$("#missingMessage").addClass("hidden");

	let search = $("#taskSearchInput").val();

	if(search.trim().length > 0)
		filterTasks();

	return taskObj;
}

$("#taskSearchInput").on("change", (ev) => {
	activeSearch = ev.target.value;
	filterTasks();
});

$("#saveBtn").on("click", (ev) => {
	const tasksStr = [];
	
	tasks.forEach((task) => {
		tasksStr.push({ title: task.title, desc: task.desc, checked: task.checked, tags: task.tags });
	});

	const tagsStr = [];

	tags.forEach((tag) => {
		tagsStr.push({ title: tag.title, color: tag.color });
	});

	alert("Copiez ce texte dans un fichier :\n" + JSON.stringify({ tasks: tasksStr, tags: tagsStr }));
});

$("#loadBtn").on("click", (ev) => {
	let str = prompt("Copier votre fichier de sauvegarde ici :\n" + ((tasks.length > 0 || tags.length > 0) ? "(Ceci va supprimer les taches et étiquettes déjà éxistantes!)" : ""));

	if(str == null)
		return;

	const save = JSON.parse(str);
	const tasksStr = save.tasks;
	const tagsStr = save.tags;

	tags.forEach((tag) => {
		tag.element.remove();
	});

	tags.length = 0;

	tasks.forEach((task) => {
		task.element.remove();
	});

	tasks.length = 0;

	tagsStr.forEach((tag) => { createTag(tag.title, tag.color); });
	tasksStr.forEach((task) => { createTask(task.title, task.desc, task.checked, task.tags); });
});

const newTaskModal = $("#newTaskModal");
const activeTaskModal = $("#currTaskModal");
let activeTask = null;

// * generic modal functions

$("[x-modal]").on("click", (ev) => { // press modal cancel button when clicking outside the window
	ev.stopPropagation();
	$("[x-cancel]", ev.target).click();
}).children().on("click", (ev) => false); // only process clicks outside the modal

// * new task modal functions

$("#newTaskBtn").on("click", (ev) => {
	newTaskModal.removeClass("hidden");
	$("#newTaskTitle").trigger("focus");
});

$("#newTaskModal button[x-cancel]").on("click", (ev) => {
	newTaskModal.addClass("hidden");
	$("#newTaskTitle").val("");
	$("[x-message]", newTaskModal).text("");
});

$("#newTaskModal button[x-submit]").on("click", (ev) => {
	const titleIn = $("#newTaskTitle");
	const message = $("[x-message]", newTaskModal);

	const title = titleIn.val();

	if(title.trim().length <= 0)
	{
		message.text("Titre invalide");
		return;
	}
	else if(findTask(title))
	{
		message.text("Cette tache existe déjà");
		return;
	}

	createTask(title);

	newTaskModal.addClass("hidden");
	message.text("");
	titleIn.val("");
});

$("#newTaskTitle").on("keydown", (ev) => {
	if(ev.key == "Enter")
		$("#newTaskModal button[x-submit]").click();
});

// * current task modal functions

function closeTaskModal()
{
	activeTask = null;
	activeTaskModal.addClass("hidden");
	$("#currTaskTitle").val("");
	$("#currTaskDesc").val("");
	$("[x-message]", activeTaskModal).text("");
}

function updateTaskDeskBox()
{
	const desc = $("#currTaskDesc");
	const val = desc.val();
	const lines = val.split(/\n/g);
	
	if(lines.length < 5)
		desc.attr("rows", 5);
	else if(lines.length > 30)
		desc.attr("rows", 30);
	else
		desc.attr("rows", lines.length);
}

$("#currTaskModal button[x-cancel]").on("click", (ev) => {
	closeTaskModal();
});

$("#currTaskModal button[x-submit]").on("click", (ev) => {
	if(activeTask)
	{
		title = $("#currTaskTitle").val();
		const message = $("[x-message]", activeTaskModal);

		if(title.trim().length <= 0)
		{
			message.text("Titre invalide");
			return;
		}
		else if(findTask(title) && findTask(title) != activeTask)
		{
			message.text("Cette tache existe déjà");
			return;
		}

		activeTask.title = title;
		$("[x-title]", activeTask.element).text(activeTask.title);
		activeTask.desc = $("#currTaskDesc").val();
	}

	closeTaskModal();
});

$("#currTaskModal button[x-delete]").on("click", (ev) => {
	if(activeTask)
	{
		activeTask.element.remove();
		tasks.splice(tasks.indexOf(activeTask), 1);

		if(tasks.length <= 0)
			$("#missingMessage").removeClass("hidden");
	}

	closeTaskModal();
});

$("#currTaskDesc").on("change", (ev2) => {
	if(activeTask)
		activeTask.desc = $("#currTaskDesc").val();
});

$("#currTaskDesc").on("keydown keyup", (ev2) => {
	updateTaskDeskBox();
});