export class Loader {
	/** @type {boolean} */
	#isActive;
	/** @type {string} */
	#loaderHtml;
	/** @type {HTMLElement} */
	#loaderElement;

	/** @type {HTMLElement} */
	#loaderParent;

	#callbacks = {
		onLoaderActive: [],
		onLoaderInActive: [],
	};

	/**
	 * @param initialState {boolean}
	 * @param options {{
	 *     active: boolean | undefined;
	 *     html: string;
	 *     parent: HTMLElement;
	 * }}
	*/
	constructor(options) {
		this.#isActive = options.active || false;
		this.#loaderHtml = options.html;
		this.#loaderParent = options.parent;
	}

	get isLoaderActive() {
		return this.#isActive;
	}

	get loaderEl() {
		if (!this.#loaderElement) {
			this.#loaderElement = this.#loaderParent.querySelector('*[data-loader]') || null;
		}
		return this.#loaderElement;
	}

	set isLoaderActive(state) {
		this.#isActive = state;
		this.#changeLoaderVisibility();
	}

	addCallbackOnLoaderActive(callback) {
		if (callback) this.#callbacks.onLoaderActive.push(callback);
	}

	addCallbackOnLoaDerInActive(callback) {
		if (callback) this.#callbacks.onLoaderInActive.push(callback);
	}

	#changeLoaderVisibility() {
		if (this.#isActive) {
			this.#loaderParent.insertAdjacentHTML('beforeend', this.#loaderHtml);
			setTimeout(() => {
				this.#callbacks.onLoaderActive.forEach((callback) => {
					callback(this);
				});
			}, 0);
		} else {
			this.loaderEl.remove();
			this.#callbacks.onLoaderInActive.forEach((callback) => {
				callback(this);
			});
		}
	}
}