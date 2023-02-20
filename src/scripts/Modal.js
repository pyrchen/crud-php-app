export class Modal {
	/** @type {boolean} */
	#isAppended = false;
	/** @type {{
	*    withCloseBtn: boolean;
	*    closeOnBgClick: boolean;
	* }}
	 * */
	#modalOptions = false;
	/** @type {boolean} */
	#isOpened = false;
	/** @type {HTMLElement} */
	#modalWrapper;
	/** @type {HTMLElement} */
	#modalWindow;

	#callbacks = {
		onModalOpened: [],
		onModalClosed: [],
	};

	/**
	 * @param options {{
	 *     withCloseBtn: boolean;
	 *     closeOnBgClick: boolean;
	 * }}
	 */
	constructor(options = { closeOnBgClick: true, withCloseBtn: false }) {
		this.#modalOptions = options;
	}

	get modalEl() {
		return this.#modalWrapper;
	}

	get modalWindow() {
		return this.#modalWindow;
	}

	openWith(html) {
		if (this.#modalOptions.withCloseBtn) {
			this.#initialiseModalInnerCLoseButton();
		}
		this.#isOpened = true;
		this.#modalWindow.insertAdjacentHTML('beforeend', html);
		this.#modalWrapper.classList.remove('closed');
		this.#modalWrapper.addEventListener('transitionend', () => {
			if (!this.#isAppended) {
				this.#isAppended = true;
			}
		});
		this.#checkOtherCLoseButton();
		this.#callbacks.onModalOpened.forEach((callback) => {
			callback(this);
		});
	}

	closeModal() {
		this.#isOpened = false;
		this.#modalWindow.innerHTML = '';
		this.#modalWrapper.classList.add('closed');
		this.#callbacks.onModalClosed.forEach((callback) => {
			callback(this);
		});
	}

	addCallbackOnModalOpened(callback) {
		this.#callbacks.onModalOpened.push(callback);
	}

	#initialiseModalWrapper() {
		const modalWrapper = document.createElement('div');
		modalWrapper.className = 'modal-wrapper closed';
		if (this.#modalOptions.closeOnBgClick) {
			modalWrapper.addEventListener('click', (event) => {
				if (event.target === event.currentTarget) {
					this.closeModal();
				}
			});
		}
		this.#modalWrapper = modalWrapper;
	}

	#initialiseModalWindow() {
		const modalWindow = document.createElement('div');
		modalWindow.className = 'modal-window';
		this.#modalWindow = modalWindow;
		this.#modalWrapper.append(modalWindow);
	}

	#initialiseModalInnerCLoseButton() {
		const closeButton = document.createElement('button');
		closeButton.className = 'modal-close modal-close-default btn';
		closeButton.innerText = '╳';
		closeButton.addEventListener('click', this.closeModal.bind(this));
		this.#modalWindow.insertAdjacentElement('afterbegin', closeButton);
	}

	#checkOtherCLoseButton() {
		const closeButton = this.#modalWindow.querySelector('.btn.modal-close');
		closeButton && closeButton.addEventListener('click', this.closeModal.bind(this));
	}

	#insertModalToDocument() {
		document.body.insertAdjacentElement('beforeend', this.#modalWrapper);
	}

	run() {
		this.#initialiseModalWrapper();
		this.#initialiseModalWindow();
		this.#insertModalToDocument();
	}
}