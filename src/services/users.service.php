<?php

namespace App\Services;

require_once __DIR__ . '/../models/JsonDatabase.php';
require_once __DIR__ . '/../common/Singleton.php';
require_once __DIR__ . '/../common/UserDto.php';

use App\Common\Dto\UserDto;
use App\Common\Pattern\Singleton;
use App\Models\JsonDatabase;
use App\Models\IDatabase;
use Error;
use stdClass;

class UsersService extends Singleton {
	private static self | null $instance = null;
	private IDatabase $database;

	public static function getInstance(): self {
		if (self::$instance === null) {
			self::$instance = new self();
		}
		return static::$instance;
	}

	protected function __construct() {
		parent::__construct();
		$this->database = new JsonDatabase('/../db/users.json', UserDto::class);
	}

	public function createUser($params): UserDto {
		$user = $this->database->create($params);
		return new UserDto($user);
	}

	public function getUser(string $value, string $anotherKey = null): UserDto | null {
		$user = $this->database->getByKey($anotherKey ?: 'login', $value);
		if (empty($user)) return null;
		return new UserDto($user);
	}

	public function editUser($params): UserDto {
		$newUserData = $this->database->editById($params);
		return new UserDto($newUserData);
	}

	public function deleteUser(string $id) {
		$this->database->deleteById($id);
	}
}