export class Request {
	/** @var {string} */
	#path;

	/** @var {XMLHttpRequest} */
	#XHR;

	#callbacks = {
		onConnectionOpened: [],
		onResponseReceived: [],
	}
	constructor(path) {
		this.#path = path;
		this.#XHR = new XMLHttpRequest();
		this.#XHR.responseType = 'json';

		this.onLoad();
	}

	addCallbackOnConnectionOpened(callback) {
		if (callback) this.#callbacks.onConnectionOpened.push(callback);
	}

	addCallbackOnResponseReceived(callback) {
		if (callback) this.#callbacks.onResponseReceived.push(callback);
	}

	onLoad() {
		this.#XHR.onreadystatechange = () => {
			if (this.#XHR.readyState === 1) {
				this.#callbacks.onConnectionOpened.forEach((callback) => {
					callback(this.#XHR.response);
				})
			} else if (this.#XHR.readyState === 4) {
				this.#callbacks.onResponseReceived.forEach((callback) => {
					callback(this.#XHR.response);
				})
			}
		}
	}
	get() {
		this.#XHR.open('GET', this.#path, true);
	}

	post = (data = { login: 'pavel' }) => {
		this.#XHR.open('POST', this.#path, true);
		this.#XHR.setRequestHeader('Content-Type', 'application/json');
		this.#XHR.send(JSON.stringify(data));
	}

	put = (data) => {
		this.#XHR.open('PUT', this.#path, true);
		this.#XHR.setRequestHeader('Content-Type', 'application/json');
		this.#XHR.send(JSON.stringify(data));
	}

	delete = () => {
		this.#XHR.open('DELETE', this.#path, true);
		this.#XHR.setRequestHeader('Content-Type', 'application/json');
		this.#XHR.send();
	}
}