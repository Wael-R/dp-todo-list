<?php

if(php_sapi_name() != "cli")
{
	http_response_code(403);
	exit();
}

require_once("./sql.php");

$sqli = getSQLI(null);

if(!querySQLI($sqli, "CREATE DATABASE IF NOT EXISTS todo"))
	errorSQLI($sqli, "Error creating database");

if(!querySQLI($sqli, "USE todo"))
	errorSQLI($sqli, "Error using database");

$query = "-- sql
DROP TABLE IF EXISTS taskTags;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS saves;

CREATE TABLE saves (
	saveId INT AUTO_INCREMENT,
	name VARCHAR(255),
	PRIMARY KEY (saveId)
);

CREATE TABLE tasks (
	taskId INT AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	checked BOOLEAN NOT NULL,
	description TEXT NOT NULL,
	save INT NOT NULL,
	PRIMARY KEY (taskId),
	FOREIGN KEY (save) REFERENCES saves(saveId) ON DELETE CASCADE
);

CREATE TABLE tags (
	tagId INT AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	color INT NOT NULL,
	save INT NOT NULL,
	PRIMARY KEY (tagId),
	FOREIGN KEY (save) REFERENCES saves(saveId) ON DELETE CASCADE
);

CREATE TABLE taskTags (
	task INT NOT NULL,
	tag INT NOT NULL,
	PRIMARY KEY (task, tag),
	FOREIGN KEY (task) REFERENCES tasks(taskId) ON DELETE CASCADE,
	FOREIGN KEY (tag) REFERENCES tags(tagId) ON DELETE CASCADE
);
";

if(!multiQuerySQLI($sqli, $query))
	errorSQLI($sqli, "Error creating tables");

echo("Database created\n");