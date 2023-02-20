<?php

namespace App\Common\Dto;

class UserDto {
	public string $id;
	public string $name;
	public string $login;
	public string $email;

	public string $hashedPassword;

	public function __construct($jsonObject) {
		if (gettype($jsonObject) === 'array') {
			if (isset($jsonObject['id'])) $this->id = $jsonObject['id'];
			if (isset($jsonObject['name'])) $this->name = $jsonObject['name'];
			if (isset($jsonObject['login'])) $this->login = $jsonObject['login'];
			if (isset($jsonObject['email'])) $this->email = $jsonObject['email'];
			if (isset($jsonObject['password'])) $this->hashedPassword = $jsonObject['password'];
		} else if (gettype($jsonObject) === 'object') {
			if (!empty($jsonObject->id)) $this->id = $jsonObject->id;
			if (!empty($jsonObject->name)) $this->name = $jsonObject->name;
			if (!empty($jsonObject->login)) $this->login = $jsonObject->login;
			if (!empty($jsonObject->email)) $this->email = $jsonObject->email;
			if (!empty($jsonObject->password)) $this->hashedPassword = $jsonObject->password;
		}
	}
}