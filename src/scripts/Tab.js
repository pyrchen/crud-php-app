export class TabContainer {

	/** @type {HTMLElement} */
	#tabsParent;

	/** @type {HTMLElement[]} */
	#tabsControls;

	/** @type {HTMLElement[]} */
	#tabs;

	/** @type {number} */
	#activeTabIndex;

	#callbacks = {
		onTabChange: [],
		onInitialise: [],
	};

	#TABS_ATTRIBUTES = {
		DATA_ACTIVE_ATTR: 'active',
		DATA_CONTROL_TAB_ATTR: 'control',
		DATA_TAB_ATTR: 'tab',
	};

	/**
	 * @param parentSelector {string}
	 * @param controlsSelector {string}
	 * @param tabsSelector {string}
	 */
	constructor(parentSelector, controlsSelector, tabsSelector) {
		this.#tabsParent = document.querySelector(parentSelector);
		this.#tabsControls = [...this.#tabsParent.querySelectorAll(controlsSelector)];
		this.#tabs = [...this.#tabsParent.querySelectorAll(tabsSelector)];

		this.activeTab = +this.#tabsParent.dataset[this.#TABS_ATTRIBUTES.DATA_ACTIVE_ATTR];
	}

	get tabsAmount() {
		return this.#tabs.length;
	}

	get activeTab() {
		return this.#activeTabIndex;
	}

	set activeTab(tabIndex) {
		this.#activeTabIndex = tabIndex;
	}

	run() {
		this.#tabsControls.forEach((tabControl) => {
			this.#setControlEvent(tabControl);
		});
	}

	afterInitialise() {
		this.#runCallbacks(this.#callbacks.onInitialise, [this.#tabsParent, this.#tabsControls, this.#tabs]);
	}

	addCallbackOnInitialise(callback) {
		if (!callback) return;
		this.#callbacks.onInitialise.push(callback);
	}

	addCallbackOnTabChange(callback) {
		if (!callback) return;
		this.#callbacks.onTabChange.push(callback);
	}

	changeTabManually(tabIndex) {
		if (tabIndex >= 0 && tabIndex < this.tabsAmount) {
			this.activeTab = tabIndex;
			this.#tabsParent.dataset[this.#TABS_ATTRIBUTES.DATA_ACTIVE_ATTR] = tabIndex;
			this.#runCallbacks(this.#callbacks.onTabChange, [this.#tabsParent, this.#tabsControls, this.#tabs]);
		}
	}

	/** @param tabControl {HTMLElement} */
	#setControlEvent(tabControl) {
		tabControl.addEventListener('click', () => {
			this.activeTab = +tabControl.dataset[this.#TABS_ATTRIBUTES.DATA_CONTROL_TAB_ATTR];
			this.#tabsParent.dataset[this.#TABS_ATTRIBUTES.DATA_ACTIVE_ATTR] = this.activeTab;

			this.#runCallbacks(this.#callbacks.onTabChange, [this.#tabsParent, this.#tabsControls, this.#tabs]);
		});
	}

	#runCallbacks(callbacksArray = [], callbackArguments = []) {
		if (!callbacksArray.length) return;
		callbacksArray.forEach((callback) => {
			callback(...callbackArguments);
		});
	}
}
