<?php

namespace App\Routing\Middlewares;

use Closure;
use Exception;
use stdClass;

function respError($http_code = 400): Closure {
	return function ($e) use ($http_code) {
		$error = new stdClass();
		$error->error = array();
		$error->error['code'] = $http_code;
		$error->error['message'] = $e->getMessage() ? $e->getMessage() : 'Something went wrong';

		http_response_code($http_code);
		echo json_encode($error);
	};
}