import {Executor} from "./Executor.js";
import {Loader} from "./Loader.js";
import {AlertsContainer} from "./Alert.js";

Executor.remember(function initLoader(parent, message = 'Fetching data') {
	const loader = new Loader({
		parent, html: `
			<div class="loader-wrapper" data-loader>
                <div class="loader-content">
                    <div class="loader-heading">${message}</div>
                    <div class="loader-item"></div>
                </div>
            </div>
		`,
	});

	loader.addCallbackOnLoaderActive(({ loaderEl }) => {
		loaderEl.style.transform = 'translateX(0%)';
	});

	return loader;
});

Executor.remember(function initInputError(inputWrapperSelector = '.input_field') {
	let errorRef = null;
	let parentsDictionary = {};

	function addErrorClassToParent(inputEl, className = 'with-error') {
		if (!parentsDictionary[inputEl.name]) {
			parentsDictionary[inputEl.name] = inputEl.closest(inputWrapperSelector);
		}
		parentsDictionary[inputEl.name]?.classList.add(className);
	}

	function removeErrorClassFromParent(inputEl, className = 'with-error') {
		if (parentsDictionary[inputEl.name]) {
			parentsDictionary[inputEl.name]?.classList.remove(className);
		}
	}

	function insertError(input, errorMessage) {
		const inputWrapper = input.closest(inputWrapperSelector);
		if (!errorRef || !inputWrapper) {
			errorRef = document.createElement('div');
			errorRef.classList.add('input_error');
			errorRef.innerText = errorMessage;
			inputWrapper.insertAdjacentElement('beforeend', errorRef);
		} else {
			errorRef.innerText = errorMessage;
		}
	}
	function removeError() {
		if (errorRef) {
			errorRef.remove();
			errorRef = null;
		}
	}

	return { insertError, removeError, addErrorClassToParent, removeErrorClassFromParent };
});

Executor.remember(function renderFormInputError(formInstance) {
	const inputErrorsRenderingFn = Executor.getFromMemory('initInputError');

	formInstance && formInstance.formInputs.forEach((inputOuter) => {
		const { insertError, removeError, addErrorClassToParent, removeErrorClassFromParent } = inputErrorsRenderingFn();
		formInstance.addCallbackOnErrorHappened((inputEl, formErrors) => {
			insertError(inputOuter, formErrors[inputOuter.name]);
			addErrorClassToParent(inputEl);
		});
		formInstance.addCallbackOnErrorDisappeared((inputEl) => {
			removeError();
			removeErrorClassFromParent(inputEl);
		});
	});
});

Executor.register('AlertsContainer', new AlertsContainer());
