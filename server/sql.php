<?php

if(is_file(__DIR__ . "/config.json"))
	$config = json_decode(file_get_contents(__DIR__ . "/config.json"));

function getSQLI(string $database = null): mysqli
{
	global $config;

	return new mysqli($config->hostname, $config->username, $config->password, $database, $config->port);
}

function querySQLI(mysqli $sqli, string $query, array $params = null): array|bool
{
	if(!$params)
		$res = $sqli->query($query);
	else
		$res = $sqli->execute_query($query, $params);

	if($res)
	{
		if($res !== true)
			return $res->fetch_all(MYSQLI_ASSOC);
		else
			return true;
	}
	else return false;
}

function multiQuerySQLI(mysqli $sqli, string $query): bool
{
	$res = $sqli->multi_query($query);

	if(!$res)
		return false;

	while($sqli->more_results())
	{
		if(!$sqli->next_result())
			return false;
	}

	return true;
}

function errorSQLI(mysqli $sqli, string $error)
{
	http_response_code(500);
	echo($error . " : " . $sqli->errno . "\n");
	exit();
}

function getParameter(string $name, $default)
{
	if($_SERVER['REQUEST_METHOD'] == "GET")
		return $_GET[$name] ?? $default;
	else
		return $_POST[$name] ?? $default;
}