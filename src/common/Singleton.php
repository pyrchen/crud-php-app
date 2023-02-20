<?php

namespace App\Common\Pattern;

abstract class Singleton {
	private static self | null $instance = null;

	abstract public static function getInstance(): self;

	protected function __construct() {}
	final protected function __clone() {}
	final public function __wakeup() {}
}