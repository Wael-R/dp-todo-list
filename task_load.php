<?php
require_once("./server/utility.php");
require_once("./server/sql.php");
$sqli = getSQLI("todo");

$saveName = $_GET["name"] ?? "";

$save = querySQLI($sqli, "SELECT * FROM saves WHERE name = ?;", [$saveName]);

if(!$save || !$save[0])
	errorSQLI($sqli, "Cette sauvegarde n'existe pas");

$saveId = $save[0]["saveId"];

$tags = querySQLI($sqli, "SELECT * FROM tags WHERE save = ?;", [$saveId]);

$tagNames = [];

$tagsJson = [];
$tasksJson = [];

foreach($tags as $tag)
{
	$tagNames[$tag["tagId"]] = $tag["name"];
	$tagsJson[] = [
		"title" => $tag["name"],
		"color" => $tag["color"]
	];
}

$tasks = querySQLI($sqli, "SELECT * FROM tasks WHERE save = ?;", [$saveId]);

foreach($tasks as $task)
{
	$taskJson = [
		"title" => $task["name"],
		"desc" => $task["description"],
		"checked" => ($task["checked"] == "1" ? true : false),
		"tags" => []
	];

	$taskTags = querySQLI($sqli, "SELECT tag FROM taskTags WHERE task = ?;", [$task["taskId"]]);

	if($taskTags)
	{
		foreach($taskTags as $taskTag)
			$taskJson["tags"][] = $tagNames[$taskTag["tag"]];
	}

	$tasksJson[] = $taskJson;
}

echo(json_encode(["tags" => $tagsJson, "tasks" => $tasksJson]));