<?php
// Database Service

namespace App\Services;

require_once __DIR__ . '/../models/JsonDatabase.php';
require_once __DIR__ . '/../common/Singleton.php';
require_once __DIR__ . '/../common/UserDto.php';
require_once __DIR__ . '/../common/MySession.php';
require_once __DIR__ . '/users.service.php';

use App\Common\Pattern\Singleton;
use Exception;
use stdClass;
use App\Common\Session\UserSession;

class AuthService extends Singleton {
	private static self | null $instance = null;
	private UsersService $usersService;
	public bool $isAuthorized = false;

	public static function getInstance(): self {
		if (self::$instance === null) {
			self::$instance = new self();
		}
		self::$instance->isAuthorized = !UserSession::getIsExpired();
		return static::$instance;
	}

	protected function __construct() {
		parent::__construct();
		$this->usersService = UsersService::getInstance();
	}

	public function authorize($userData): void {
		$this->isAuthorized = true;
		UserSession::updateUserData($userData);
		UserSession::updateCreatedTime();
	}

	public function unAuthorize(): void {
		$this->isAuthorized = false;
		UserSession::destroy();
	}

	public function signin($signinData): stdClass {
		$user = $this->usersService->getUser($signinData['login']);

		if (empty($user)) {
			$this->unAuthorize();
			throw new Exception("Such a user doesn't exist");
		}

		$this->verifyPasswords($signinData['password'], $user->hashedPassword);

		unset($user->hashedPassword);

		$this->authorize($user);

		$userData = new stdClass();
		$userData->user = $user;
		return $userData;
	}

	public function signup($params): stdClass {
		$user = $this->usersService->getUser($params['login']);
		$userByEmail = $this->usersService->getUser($params['email'], 'email');

		if (!empty($user)) throw new Exception('User with such login already exists');
		if (!empty($userByEmail)) throw new Exception('User with such email already exists');

		if ($params['password'] !== $params['confirm']) {
			throw new Exception("Password wasn't confirmed");
		}

		$params = array_merge($params, array(
			'password' => password_hash($params['password'], PASSWORD_DEFAULT)
		));

		$user = $this->usersService->createUser($params);

		unset($user->hashedPassword);

		$userData = new stdClass();
		$userData->user = $user;
		return $userData;
	}

	public function logout(): void {
		$this->unAuthorize();
	}

	public function verifyPasswords(string $enteredPassword, string $hashedPassword): void {
		$isPasswordVerified = password_verify($enteredPassword, $hashedPassword);
		if (!$isPasswordVerified) throw new Exception('Wrong password or login');
	}
}
