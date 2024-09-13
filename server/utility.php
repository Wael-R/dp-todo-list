<?php
function mergeKeys(array $from, array $to, string... $singleKeys)
{
	foreach($from as $key => $value)
	{
		if(in_array($key, $singleKeys))
		{
			$to[$key] = $value;
			continue;
		}

		if(!isset($to[$key]))
				$to[$key] = [];

		if(!in_array($value, $to[$key]) && $value != null)
			$to[$key][] = $value;
	}

	return $to;
}

function addSearch($key, $value)
{
	if($_SERVER['QUERY_STRING'] != "")
		$query = "&" . $_SERVER['QUERY_STRING'];
	else
		$query = "";

	$keyEq = $key . "=";
	$valueEnc = urldecode($value);
	if(($start = stripos($query, "&")) !== false)
	{
		$search = substr($query, $start);

		$idx = stripos($search, "&" . $keyEq);
		if($idx !== false)
		{
			$amp = stripos($search, "&", $idx + 1);

			if($amp === false)
				$amp = strlen($search);

			$final = str_replace(substr($search, $idx + 1, $amp - ($idx + 1)), $keyEq . $valueEnc, $search);

			return "?" . substr($final, 1);
		}
		else
			return "?" . substr($search . "&" . $keyEq . $valueEnc, 1);
	}
	else
		return "?" . $keyEq . $valueEnc;
}