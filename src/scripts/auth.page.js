import { MyForm } from "./Form.js";
import { TabContainer } from "./Tab.js";
import { Request } from "./Request.js";
import { Validation } from "./Validation.js";
import {Executor} from "./Executor.js";

import './common.executor.js';

// Adding additional functionality related to the
// concrete realization of page HTML

Executor.remember(function initFormExtensions(form, route) {
	const request = new Request(route);
	const loader = Executor.getFromMemory('initLoader')(form.formEl);
	const renderFormInputErrorFn = Executor.getFromMemory('renderFormInputError');

	request.addCallbackOnConnectionOpened(() => {
		loader.isLoaderActive = true;
	});
	request.addCallbackOnResponseReceived(() => {
		loader.isLoaderActive = false;
	});

	form.addCallbackOnSubmit(request.post);

	renderFormInputErrorFn(form);

	return { form, loader, request };
})

// Registration main abstraction functionality

Executor.register('TabsContainer', new TabContainer('.tabs-wrapper', '*[data-control]', '*[data-tab]'))
	.saveCallback(function calculateTabsStyles(tabContainer, parent, tabs) {
		const tabsActiveLine = parent.querySelector('.tabs-line-inner');
		const tabsWrapper = tabs[0].closest('div.tabs');
		const percentPerTab = 100 / tabContainer.tabsAmount;
		if (tabContainer.activeTab === 0) {
			tabs[1].style.display = 'none';
		} else {
			tabs[1].style.display = '';
		}
		tabsActiveLine.style.width = percentPerTab + '%';
		tabsActiveLine.style.marginLeft = percentPerTab * tabContainer.activeTab + '%';
		tabsWrapper.style.transform = `translateX(${-1 * tabContainer.activeTab * 50}%)`;
	})
	.saveCallback(function changeHeading(tabContainer, tabControls) {
		const pageHeading = document.querySelector('.sign-method-heading');
		const activeTabControl = tabControls[tabContainer.activeTab];
		pageHeading.innerText = activeTabControl.innerText;
	})
	.doNext((tabContainer, savedCallbacks) => {
		const AUTH_TAB_NAME = 'AUTH_ACTIVE_TAB';
		tabContainer.addCallbackOnInitialise((parent, controls, tabs) => {
			const activeTabLS = localStorage.getItem(AUTH_TAB_NAME);
			if (!activeTabLS) localStorage.setItem(AUTH_TAB_NAME, tabContainer.activeTab);
			else {
				tabContainer.activeTab = +activeTabLS;
			}
			savedCallbacks.calculateTabsStyles(tabContainer, parent, tabs);
			savedCallbacks.changeHeading(tabContainer, controls);
		});
		tabContainer.addCallbackOnTabChange((parent, controls, tabs) => {
			localStorage.setItem(AUTH_TAB_NAME, tabContainer.activeTab);
			savedCallbacks.calculateTabsStyles(tabContainer, parent, tabs);
			savedCallbacks.changeHeading(tabContainer, controls);
		});
	});

Executor.register('SignInForm', new MyForm('signin', Validation))
	.doNext((form, _, { AlertsContainer }) => {
		const { request } = Executor.getFromMemory('initFormExtensions')(form, '/app/auth/signin');
		request.addCallbackOnResponseReceived((response) => {
			if (!response?.user && response?.error) {
				AlertsContainer.addAlert(response.error.message, AlertsContainer.statuses.ERROR);
			} else if (response?.user) {
				AlertsContainer.addAlert('Successfully signed in!', AlertsContainer.statuses.SUCCESS);
				window.location.href = window.location.origin + '/app/home';
			}
		})
	});

Executor.register('SignUpForm', new MyForm('signup', Validation))
	.doNext((form, _, { TabsContainer, AlertsContainer }) => {
		const { request } = Executor.getFromMemory('initFormExtensions')(form, '/app/auth/signup');
		request.addCallbackOnResponseReceived((response) => {
			if (!response?.user && response?.error) {
				AlertsContainer.addAlert(response.error.message, AlertsContainer.statuses.ERROR);
			} else if (response?.user) {
				AlertsContainer.addAlert('Account was successfully created!', AlertsContainer.statuses.SUCCESS);
				TabsContainer.changeTabManually(0);
			}
		});
	});

// Running all functionalities
Executor.run();