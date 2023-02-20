import {Executor} from "./Executor.js";
import {Modal} from "./Modal.js";
import {Request} from "./Request.js";
import {MyForm} from "./Form.js";
import {Validation} from "./Validation.js";
import {AlertsContainer} from './Alert.js';

import './common.executor.js';

// Adding additional functionality related to the
// concrete realization of page HTML

Executor.remember(function initialiseChangeFormTemplate(target) {
	const changeKey = target.dataset.change;
	return `
		<form id="change" method="post">
			<h2 style="font-weight:400;text-align:center;">Changing of ${changeKey}</h1>
	        <div class="input_field">
	            <label for="change-${changeKey}">New ${changeKey}*</label>
	            <input
	            	id="change-${changeKey}"
	            	type="${changeKey === 'email' ? 'email' : 'text'}"
	            	name="${changeKey}"
	            	placeholder="Enter new ${changeKey}">
	        </div>
	        <div class="input_field">
	            <label for="change-password">Password*</label>
	            <input
	            	id="change-password"
	            	type="password"
	            	name="password"
	            	placeholder="Enter password">
	        </div>
	        <button type="submit" class="btn">Change ${changeKey}</button>
	    </form>
	`;
});

Executor.remember(function initialiseDeleteTemplate() {
	return `
		<div style="padding: 20px 15px" class="delete-account-wrapper">
			<h2 style="font-weight:400;margin-bottom:25px;">Do you really want to delete the account?</h2>
			<div style="display:flex;justify-content:space-around;">
				<button class="btn modal-close">Cancel</button>
				<button class="btn modal-submit btn-error">Yes, delete</button>
			</div>
		</div>
	`;
});

// Registration main abstraction functionality

Executor.register('DeleteModal', new Modal({ withCloseBtn: false, closeOnBgClick: true }));

Executor.register('ChangeModal', new Modal({ withCloseBtn: true, closeOnBgClick: true }))
	.saveCallback(function setTriggers(modal, triggersSelector, templateFn, templateArgs = []) {
		const triggerButtons = document.querySelectorAll(triggersSelector);

		triggerButtons.forEach((btn) => {
			btn.addEventListener('click', (event) => {
				const template = templateFn(templateArgs.length ? templateArgs : event.target);
				modal.openWith(template);
			});
		});
	})
	.doNext((ChangeModal, { setTriggers }, { DeleteModal, AlertsContainer }) => {
		const changeFormTemplate = Executor.getFromMemory('initialiseChangeFormTemplate');
		const renderFormInputErrorFn = Executor.getFromMemory('renderFormInputError');
		let form;
		const request = new Request('/app/user/change');

		setTriggers(ChangeModal, '*[data-trigger][data-change]', changeFormTemplate);

		ChangeModal.addCallbackOnModalOpened(() => {
			form = new MyForm('change', Validation);
			form.run();

			const loader = Executor.getFromMemory('initLoader')(form.formEl);

			form.addCallbackOnSubmit(request.put);

			request.addCallbackOnConnectionOpened(() => {
				loader.isLoaderActive = true;
			});

			request.addCallbackOnResponseReceived((response) => {
				ChangeModal.closeModal();
				loader.isLoaderActive = false;
				if (!response?.user && (response?.error || !response?.changedData)) {
					return AlertsContainer.addAlert(response?.error?.message, AlertsContainer.statuses.ERROR);
				}
				for (const responseKey in response.changedData) {
					document.querySelectorAll(`.user-${responseKey}`).forEach((element) => {
						element.innerText = response.changedData[responseKey];
					});
					AlertsContainer.addAlert(`Your ${responseKey} was successfully changed!`, AlertsContainer.statuses.SUCCESS);
					return;
				}
			});
		});

		ChangeModal.addCallbackOnModalOpened(() => {
			form && renderFormInputErrorFn(form);
		});

		return { DeleteModal };
	})
	.doNext(({ DeleteModal }, { setTriggers }) => {
		const getDeleteTemplate = Executor.getFromMemory('initialiseDeleteTemplate');
		const deleteLoader = Executor.getFromMemory('initLoader')(DeleteModal.modalWindow, 'Waiting for the result');
		const deleteRequest = new Request('/app/user/delete');

		setTriggers(DeleteModal, '*[data-trigger=delete]', getDeleteTemplate);

		DeleteModal.addCallbackOnModalOpened(() => {
			const deleteAccountWrapper = document.querySelector('.delete-account-wrapper');
			const deleteAccountBtn = deleteAccountWrapper.querySelector('button.modal-submit');

			deleteAccountBtn.addEventListener('click', () => {
				deleteRequest.delete();
			})
		})

		deleteRequest.addCallbackOnConnectionOpened(() => {
			deleteLoader.isLoaderActive = true;
		});

		deleteRequest.addCallbackOnResponseReceived(() => {
			deleteLoader.isLoaderActive = false;
			DeleteModal.closeModal();
			window.location.href = window.location.origin + '/app/auth';
		})
	});

Executor.run();