<?php
// Database Class

namespace App\Models;

use stdClass;

interface IFileReader {
	public function getFileContent(): string;
	public function readFile(): void;
	public function addToFile(string $jsonString): void;

	public function editFile(string $editString, string $newString): void;

	public function deleteFromFile(string $jsonString): void;
}

class JsonFileReader implements IFileReader {
	private string $relativefilePath;
	private string $absoluteFilePath;

	private string $jsonFileString;

	public function __construct($relativefilePath) {
		$this->relativefilePath = $relativefilePath;
		$this->absoluteFilePath = __DIR__.$relativefilePath;
		$this->readFile();
	}

	public function getFileContent(): string {
		return $this->jsonFileString;
	}

	public function deleteFromFile(string $jsonString): void {
		file_put_contents(
			$this->absoluteFilePath,
			$jsonString,
		);
		$this->readFile();
	}

	public function editFile(string $editString, string $newString): void {
		file_put_contents(
			$this->absoluteFilePath,
			str_replace($editString, $newString, $this->jsonFileString)
		);
		$this->readFile();
	}

	public function addToFile(string $jsonString): void {
		file_put_contents(
			$this->absoluteFilePath,
			$jsonString,
		);
		$this->readFile();
	}

	public function readFile(): void {
		if (!file_exists(__DIR__.$this->relativefilePath)) throw new \Error('No file');
		$this->jsonFileString = file_get_contents(__DIR__.$this->relativefilePath);
	}
}