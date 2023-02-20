import { IValidation } from './Validation.js';

export class MyForm {
	/** @type {HTMLFormElement} */
	formEl;
	/** @type {HTMLInputElement[]} */
	#formInputs;
	#formInputsDictionary;
	/** @type {HTMLButtonElement} */
	#submitButton;

	/** @type {Object} */
	#state;

	/** @type {{}} */
	#errors;

	#callbacks = {
		onSubmit: [],
		onErrorHappened: [],
		onErrorDisappeared: [],
	};

	#CHANGE_STATE_METHODS = {
		INPUT: {
			text: 'input',
			password: 'input',
			email: 'input',
			checkbox: 'change',
			radio: 'change',
		},
		TEXTAREA: 'input',
		SELECT: 'change',
	};

	/** @param formId {string}
	 *  @param ValidationClass {IValidation | undefined}
	 * */
	constructor(formId, ValidationClass) {
		this.formEl = document.forms[formId] || document.querySelector(`#${formId}`);
		this.ValidationClass = ValidationClass;
	}

	get formState() {
		return this.#state;
	}

	/**
	 * @returns {{}|null}
	 */
	get formErrors() {
		if (!this.#errors) return null;
		return Object.assign({}, this.#errors);
	}

	get formInputs() {
		return this.#formInputs;
	}

	run() {
		this.#setFormSubmitEvent();
		this.#registerFormInputs();
		this.#registerFormSubmitButton();
		this.#initialiseState();
		if (this.ValidationClass) {
			this.#initialiseErrors();
			this.#setValidation();
		}
		this.#bindFormInputsEventsToState();
	}

	addCallbackOnSubmit(callback) {
		if (callback) {
			this.#callbacks.onSubmit.push(callback);
		}
	}

	addCallbackOnErrorHappened(callback) {
		if (callback) {
			this.#callbacks.onErrorHappened.push(callback);
		}
	}

	addCallbackOnErrorDisappeared(callback) {
		if (callback) {
			this.#callbacks.onErrorDisappeared.push(callback);
		}
	}

	#setValidation() {
		this.ValidationClass = this.ValidationClass ? new this.ValidationClass(Object.keys(this.#state)) : {
			validateValue() { return {}; },
		};
	}

	#setFormSubmitEvent() {
		this.formEl.addEventListener('submit', (event) => {
			event.preventDefault();
			this.#formInputs.forEach((input) => {
				this.#validateInput({ target: input });
			});
			if (this.formErrors && Object.values(this.formErrors).filter((val) => !!val).length > 0) return;
			this.#callbacks.onSubmit.forEach((callback) => {
				callback(this.formState);
			});
			this.#reset();
		});
	}

	#reset() {
		this.formInputs.forEach((input) => {
			input.value = '';
		});
		for (const stateKey in this.#state) {
			this.#state[stateKey] = '';
		}
		if (this.#errors) {
			for (const errorKey in this.#errors) {
				this.#errors[errorKey] = null;
			}
		}
	}

	#registerFormSubmitButton() {
		this.#submitButton = [...this.formEl].find((element) => {
			return element.tagName === 'BUTTON'	&& element.type === 'submit';
		});
	}

	#registerFormInputs() {
		this.#formInputs = [...this.formEl].filter((element) => {
			return element.tagName !== 'BUTTON';
		});
		this.#formInputsDictionary = this.#formInputs.reduce((acc, input) => {
			acc[input.name] = input;
			return acc;
		}, {});
	}

	#initialiseErrors() {
		const errorsObject = Object.keys(this.#state).reduce((acc, key) => {
			acc[key] = null;
			return acc;
		}, {});
		const self = this;
		this.#errors = new Proxy(errorsObject, {
			set(target, prop, newValue, receiver) {
				if (target[prop] === newValue) return true;
				Reflect.set(target, prop, newValue, receiver);
				if (newValue === null) {
					self.#callbacks.onErrorDisappeared.forEach((callback) => {
						callback(self.#formInputsDictionary[prop], self.formErrors, self.formState);
					});
				} else {
					self.#callbacks.onErrorHappened.forEach((callback) => {
						callback(self.#formInputsDictionary[prop], self.formErrors, self.formState);
					});
				}
				return true;
			}
		});
	}

	#initialiseState() {
		this.#state = this.#formInputs.reduce((acc, inputEl) => {
			const inputName = inputEl.name;
			if (!inputName) return acc;
			acc[inputName] = inputEl.value || '';
			return acc;
		}, {});
	}

	#bindFormInputsEventsToState() {
		this.#formInputs.forEach((inputEl) => {
			const appropriateEvent = this.#defineAppropriateEvent(inputEl);
			inputEl.addEventListener(appropriateEvent, this.#inputEventCallback);
			inputEl.addEventListener('blur', this.#blurEventCallback);
		});
	}

	#defineAppropriateEvent(element) {
		const tag = element.tagName;
		if (typeof this.#CHANGE_STATE_METHODS[tag] !== "string") {
			return this.#CHANGE_STATE_METHODS[tag][element.type];
		}
		return this.#CHANGE_STATE_METHODS[tag];
	}

	#inputEventCallback = (event) => {
		const { value, name: elementName } = event.target;
		this.#state[elementName] = value;
		if (this.#errors[elementName]) this.#validateInput(event);
	}

	#blurEventCallback = (event) => {
		this.#validateInput(event);
	}

	#validateInput(event) {
		if (!this.ValidationClass) return;
		const { value, name: elementName, dataset } = event.target;
		let requiredFields = dataset.required ? dataset.required.split(',') : [];
		requiredFields = requiredFields.reduce((acc, requiredName) => {
			const requiredEl = this.#formInputs.find((input) => input.name === requiredName);
			if (requiredEl) {
				acc[requiredName] = requiredEl.value || '';
			}
			return acc;
		}, {});
		const { isValid, message } = this.ValidationClass.validateValue(elementName, value, requiredFields);
		this.#errors[elementName] = isValid ? null : message;
		this.#submitButton.disabled = !isValid;
		return isValid;
	}
}
