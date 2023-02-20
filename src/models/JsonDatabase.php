<?php

namespace App\Models;

require_once __DIR__ . '/JsonReader.php';

interface IDatabase {
	public function getByKey(string $key, string $value);
	public function create($data);
	public function editById($newData);
	public function deleteById(string $id);
}

class JsonDatabase implements IDatabase {
	private IFileReader $reader;

	private array $json;

	public function __construct($path) {
		$this->reader = new JsonFileReader($path);
		$this->json = json_decode($this->reader->getFileContent(), true);
		if (empty($this->json)) {
			$this->json = array();
		}
	}

	public function getByKey(string $key, string $value) {
		foreach ($this->json as $object) {
			$objValue = $object[$key];
			if (gettype($objValue) === 'integer') {
				$objValue = strval($objValue);
			}
			if ($objValue === $value) return $object;
		}
		return null;
	}

	public function create($data) {
		if (empty($data['id'])) {
			$data['id'] = uniqid();
		}
		$this->json[count($this->json)] = $data;
		$this->reader->addToFile(json_encode($this->json));
		$this->reJson();
		return $data;
	}

	public function editById($newData) {
		$neededObject = $this->getByKey('id', $newData['id']);
		if ($neededObject) {
			$this->reader->editFile(json_encode($neededObject), json_encode(array_merge($neededObject, $newData)));
		}
		$this->reJson();
		return $neededObject;
	}

	public function deleteById(string $id): void {
		$neededObject = $this->getByKey('id', $id);
		if ($neededObject) {
			$newJson = array_filter($this->json, function($a) use ($neededObject) {
				return $a['id'] !== $neededObject['id'];
			});

			$this->reader->deleteFromFile(json_encode($newJson));
		}
		$this->reJson();
	}

	private function reJson() {
		$this->json = json_decode($this->reader->getFileContent(), true);
	}
}