function httpRequest(target, method = "GET", onSuccess = null, onFail = null, body = null, headers = [])
{
	const request = new XMLHttpRequest();

	request.onreadystatechange = (ev) => {
		if(request.readyState == 4)
		{
			if(request.status == 200)
			{
				if(onSuccess)
					onSuccess(request);
			}
			else
			{
				if(onFail)
					onFail(request);
			}
		}
	};

	request.open(method, target);

	headers.forEach((head) => {
		request.setRequestHeader(head[0], head[1]);
	});

	request.send(body);
}

function errorMessage(request, errorTarget)
{
	$(errorTarget).text(`Erreur ${request.status} : ${request.responseText}`);
}