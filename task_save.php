<?php
require_once("./server/sql.php");
$sqli = getSQLI("todo");

$saveJson = json_decode(file_get_contents("php://input"), true);

$saveName = trim($saveJson["name"]);
$saveData = $saveJson["data"];

if(strlen($saveName) <= 0)
{
	http_response_code(400);
	exit("Nom invalide");
}

querySQLI($sqli, "DELETE FROM saves WHERE name = ?;", [$saveName]);

if(!querySQLI($sqli, "INSERT INTO saves (name) VALUES (?);", [$saveName]))
	errorSQLI($sqli, "Erreur lors de la création de la sauvegarde");

$saveId = $sqli->insert_id;

$tags = [];

foreach($saveData["tags"] as $tag)
{
	if(!querySQLI($sqli, "INSERT INTO tags (save, name, color) VALUES (?, ?, ?);", [$saveId, $tag["title"], $tag["color"]]))
		errorSQLI($sqli, "Erreur lors de la sauvegarde d'une étiquette");

	$tags[$tag["title"]] = $sqli->insert_id;
}

foreach($saveData["tasks"] as $task)
{
	if(!querySQLI($sqli, "INSERT INTO tasks (save, name, checked, description) VALUES (?, ?, ?, ?);", [$saveId, $task["title"], $task["checked"], $task["desc"]]))
		errorSQLI($sqli, "Erreur lors de la sauvegarde d'une tache");

	$taskId = $sqli->insert_id;

	foreach($task["tags"] as $tag)
	{
		$tagId = $tags[$tag];

		if(!querySQLI($sqli, "INSERT INTO taskTags (task, tag) VALUES (?, ?);", [$taskId, $tagId]))
			errorSQLI($sqli, "Erreur lors de l'attribution d'une étiquette");
	}
}