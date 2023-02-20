<?php

namespace App\Common\Session;

require_once __DIR__ . '/../common/Singleton.php';
require_once __DIR__ . '/../common/UserDto.php';

use App\Common\Dto\UserDto;
use App\Common\Pattern\Singleton;

class UserSession {

	const EXPIRE_SECONDS = 180;
	const SESSION_ACCESSIBLE_USER_DATA_KEYS = ['id', 'name', 'login', 'email'];
	const SESSION_KEYS = [
		'USER_DATA' => 'USER_DATA',
		'CREATED' => 'CREATED',
	];

	public static function getIsExpired(): bool {
		if (!self::sessionStarted()) return true;
		if (!self::getCreatedTime()) return true;
		if (time() - self::getCreatedTime() > self::EXPIRE_SECONDS) return true;
		return false;
	}

	public static function getUserData(): array | null {
		if (!self::sessionStarted() || !isset($_SESSION[self::SESSION_KEYS['USER_DATA']])) return null;
		return $_SESSION[self::SESSION_KEYS['USER_DATA']];
	}

	public static function getCreatedTime(): string | null {
		if (!self::sessionStarted() || !isset($_SESSION[self::SESSION_KEYS['CREATED']])) return null;
		return $_SESSION[self::SESSION_KEYS['CREATED']];
	}

	public static function start(): void {
		session_start();
	}

	public static function regenerate(): void {
		if (!self::sessionStarted()) return;
		session_regenerate_id();
		self::updateCreatedTime();
	}

	private static function sessionStarted(): bool {
		if (session_id()) return true;
		return false;
	}

	public static function destroy(): void {
		if (!self::sessionStarted()) return;
		foreach (self::SESSION_KEYS as $key) {
			unset($_SESSION[$key]);
		}
		session_destroy();
	}

	public static function updateCreatedTime(): void {
		$_SESSION[self::SESSION_KEYS['CREATED']] = time();
	}

	public static function updateUserData(UserDto $params): void {
		$sessionUserDataKey = self::SESSION_KEYS['USER_DATA'];
		if (!self::getUserData()) {
			$_SESSION[$sessionUserDataKey] = array();
			foreach (self::SESSION_ACCESSIBLE_USER_DATA_KEYS as $keyField) {
				$_SESSION[$sessionUserDataKey][$keyField] = '';
			}
		}
		foreach (self::SESSION_ACCESSIBLE_USER_DATA_KEYS as $keyField) {
			if (!empty($params->{$keyField}) && $params->{$keyField} !== $_SESSION[$sessionUserDataKey][$keyField]) {
				$_SESSION[$sessionUserDataKey][$keyField] = $params->{$keyField};
			}
		}
	}
}