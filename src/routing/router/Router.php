<?php

namespace App\Routing;

require_once __DIR__ . '/RoutesData.php';

use App\Routing\RoutesData;
use Closure;
use Exception;

interface ICommonRouter {
	public function run(): void;
	public function get(string $path, $handler): Closure;
	public function post(string $path, $handler): Closure;
	public function put(string $path, $handler): Closure;
	public function delete(string $path, $handler): Closure;
}
class Router implements ICommonRouter {
	private static bool $routeFound = false;
	private string $root = '';
	private array $handlers = [];

	private Closure | null $notFoundHandler = null;

	private Closure | null $onEach = null;

	private const HTTP_METHODS = [
		'GET' => 'GET',
		'POST' => 'POST',
		'PUT' => 'PUT',
		'DELETE' => 'DELETE',
	];

	public function __construct(string | null $root) {
		if ($root) {
			$this->root .= $root;
		}
		$_REQUEST = json_decode(file_get_contents('php://input'), true);
	}

	public function get(string $path, ...$middlewares): Closure {
		return $this->addHandler(self::HTTP_METHODS['GET'], $path, $middlewares);
	}

	public function post(string $path, ...$middlewares): Closure {
		return $this->addHandler(self::HTTP_METHODS['POST'], $path, $middlewares);
	}

	public function put(string $path, ...$middlewares): Closure {
		return $this->addHandler(self::HTTP_METHODS['PUT'], $path, $middlewares);
	}

	public function delete(string $path, ...$middlewares): Closure {
		return $this->addHandler(self::HTTP_METHODS['DELETE'], $path, $middlewares);
	}

	public function addNotFoundHandler($handler) {
		$this->notFoundHandler = $handler;
	}

	public function addCallbackOnEachHandlerCall($onEach): void {
		$this->onEach = $onEach;
	}

	public function run(): void {
		$requestUri = parse_url($_SERVER['REQUEST_URI']);
		$requestPath = trim($requestUri['path']);
		$method = $_SERVER['REQUEST_METHOD'];

		$activeHandler = null;

		foreach ($this->handlers as $handler) {
			if ($handler['path'] === $requestPath && $handler['method'] === $method) {
				$activeHandler = $handler;
			}
		}
		if (!empty($activeHandler)) {
			foreach ($activeHandler['middlewares'] as $middleware) {
				try {
					if ($this->onEach !== null) call_user_func($this->onEach);

					$middleware($_REQUEST, function () use (&$activeHandler) {
						$this->next($activeHandler);
					});
				} catch (Exception $e) {
					if (!empty($activeHandler['onError'])) {
						$activeHandler['onError']($e);
						break;
					}
				}
				if (!$activeHandler['isNext']) break;
			}
		}

		$found = $method !== 'GET';
		foreach (RoutesData::$ROUTES as $route) {
			if ($found) break;
			if (gettype($route) === 'array') {
				foreach ($route as $routeKey => $innerRoute) {
					if ($routeKey === 'ROOT') {
						$found = $requestPath === ($route['ROOT'] . '') && $method === 'GET';
					} else {
						$found = $requestPath === ($route['ROOT'] . $innerRoute) && $method === 'GET';
					}
					if ($found) break;
				}
			} else {
				$found = $requestPath === $route && $method === 'GET';
			}
		}

		if (!$found) {
			header('HTTP/1.0 404 Not Found');
			if ($this->notFoundHandler !== null) call_user_func($this->notFoundHandler);
		}
	}

	private function addHandler(string $method, string $path, array $middlewares = []): Closure {
		$key = $method . '-' . $this->root . $path;

		if ($path === '/' && $method === 'GET') $path = '';

		$this->handlers[$key] = [
			'path' => trim($this->root . $path),
			'method' => $method,
			'middlewares' => $middlewares,
			'onError' => null,
			'isNext' => false,
		];

		return function ($onErrorFunc) use ($key) {
			$this->handlers[$key]['onError'] = $onErrorFunc;
		};
	}

	private function next(&$handler) {
		if (!empty($handler) && isset($handler['isNext'])) {
			$handler['isNext'] = true;
		}
	}
}