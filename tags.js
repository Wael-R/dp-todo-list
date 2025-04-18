const tagColors = ["btn-blue", "btn-pink", "btn-red", "btn-orange", "btn-yellow", "btn-green", "btn-cyan"];
const newTagModal = $("#newTagModal");
const addTagModal = $("#addTagModal");
let tagIdx = 0;

const tags = [];

const activeTags = []; // tags to filter
let activeTag = null;

function taskHasTags(task, tags)
{
	if(tags.length > 0)
	{
		if(task.tags.length <= 0)
			return false;

		for(let i = 0; i < tags.length; i++)
		{
			if(!task.tags.find((val) => val == tags[i].title))
				return false;
		}
	}
	else if(task.tags.length > 0)
		return false;

	return true;
}

function findTag(name)
{
	return tags.find((val) => val.title == name);
}

function createTag(title, color = 0)
{
	if(findTag(title))
		return null;

	if(color >= tagColors.length)
		color = 0;
	else if(color < 0)
		color = 0;

	const tag = $("#tmpTagList").clone().attr("id", `tag${tagIdx}`);
	const tagObj = {element: tag, title: title, color: color, idx: tagIdx};

	$("[data-title]", tag).text(title).addClass(tagColors[color]);

	tagIdx++;
	$("#tagContainer").append(tag);

	$("[data-title]", tag).on("click", (ev2) => {
		let idx = activeTags.indexOf(tagObj);

		if(idx >= 0)
		{
			activeTags.splice(idx, 1);
			$("[data-title]", tag).removeClass("fw-bold td-under");

			if(activeTags.length <= 0)
				$("#tagFilterBtn").addClass("hidden");
		}
		else
		{
			activeTags.push(tagObj);
			$("#tagFilterBtn").removeClass("hidden");
			$("[data-title]", tag).addClass("fw-bold td-under");
		}

		filterTasks();
	});

	$("[data-add]", tag).on("click", (ev2) => {
		activeTag = tagObj;
		addTagModal.removeClass("hidden");
		$("#addTagTarget").children().remove();

		tasks.forEach((task) => {
			const opt = $("#tmpOption").clone().removeAttr("id");

			opt.text(task.title).val(task.title);

			if(taskHasTags(task, [tagObj]))
				opt.attr("disabled", "");

			$("#addTagTarget").append(opt);
		});

		$("#addTagTarget").trigger("focus").val("");
	});

	$("[data-delete]", tag).on("click", (ev2) => {
		tag.remove();

		tasks.forEach((task) => {
			let idx = task.tags.indexOf(title);

			if(idx >= 0)
			{
				task.tags.splice(idx, 1);
				$(`[data-tag-idx="${tagObj.idx}"]`, task.element).remove();
			}
		});

		tags.splice(tags.indexOf(tagObj), 1);

		if(activeTags.includes(tagObj))
			activeTags.splice(activeTags.indexOf(tagObj), 1);

		if(activeTags.length <= 0)
			$("#tagFilterBtn").addClass("hidden");

		if(tags.length <= 0)
			$("#missingTagMessage").removeClass("hidden");

		filterTasks();
	});

	if(tags.length > 0)
		tags[tags.length - 1].element.addClass("mb-1");

	tags.push(tagObj);

	$("#missingTagMessage").addClass("hidden");

	return tagObj;
}

function createTagLabel(tag)
{
	const idx = tag.idx;
	const elem = $("#tmpTag").clone().removeAttr("id").attr("data-tag-idx", idx);
	elem.addClass(tagColors[tag.color]).text(tag.title);

	elem.on("click", (ev2) => {
		$(`#tag${idx} [data-title]`).click();
	});

	return elem;
}

$("#tagFilterBtn").on("click", (ev) => {
	$("#tagFilterBtn").addClass("hidden");
	$("#tagContainer [data-title]").removeClass("fw-bold td-under");
	activeTags.length = 0;
	filterTasks();
});

// * new tag modal functions

$("#newTagBtn").on("click", (ev) => {
	newTagModal.removeClass("hidden");
	$("#newTagTitle").trigger("focus");
});

$("#newTagCancelBtn").on("click", (ev) => {
	newTagModal.addClass("hidden");
	$("#newTagTitle").val("");
	$("#newTagMessage").text("");
});

$("#newTagCreateBtn").on("click", (ev) => {
	const titleIn = $("#newTagTitle");
	const colorIn = $("#newTagColor");
	const message = $("#newTagMessage");

	const title = titleIn.val();
	const color = colorIn.val();

	if(title.trim().length <= 0)
	{
		message.text("Titre invalide");
		return;
	}
	else if(findTag(title))
	{
		message.text("Cette étiquette existe déjà");
		return;
	}

	createTag(title, color);

	newTagModal.addClass("hidden");
	message.text("");
	titleIn.val("");
});

$("#newTagTitle").on("keydown", (ev) => {
	if(ev.key == "Enter")
		$("#newTagCreateBtn").click();
});

// * add tag modal functions

$("#addTagCancelBtn").on("click", (ev) => {
	addTagModal.addClass("hidden");
	$("#addTagMessage").text("");
});

$("#addTagAddBtn").on("click", (ev) => {
	const targetIn = $("#addTagTarget");
	const message = $("#addTagMessage");
	const task = findTask(targetIn.val());

	if(!task)
	{
		message.text("Tache invalide");
		return;
	}
	else if(taskHasTags(task, [activeTag]))
	{
		message.text("Cette tache a déjà cette étiquette");
		return;
	}

	const tag = createTagLabel(activeTag);

	task.tags.push(activeTag.title);
	$("[data-tag-div]", task.element).append(tag);

	addTagModal.addClass("hidden");
	message.text("");
});