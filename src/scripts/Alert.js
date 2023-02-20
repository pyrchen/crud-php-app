export class AlertsContainer {
	#FADE_TIME = 5000;
	#ALERT_STATUSES = {
		SUCCESS: 'success',
		ERROR: 'error',
		WARNING: 'warning',
	};
	#MAX_ALERTS_AMOUNT = 5;
	/**
	 * @type {HTMLElement}
	 */
	#alertContainer = null;

	get statuses() {
		return this.#ALERT_STATUSES;
	}

	get alertsAmount() {
		return this.#alertContainer.children.length;
	}

	addAlert(message = '', status = this.#ALERT_STATUSES.SUCCESS) {
		if (!this.#alertContainer) return;
		if (!message) {
			switch (status) {
				case this.#ALERT_STATUSES.SUCCESS: {
					message = 'Success!';
					break;
				}
				case this.#ALERT_STATUSES.WARNING: {
					message = 'Warning!';
					break;
				}
				case this.#ALERT_STATUSES.ERROR: {
					message = 'Error!';
					break;
				}
			}
		}
		const alert = document.createElement('div');
		alert.className = `alert alert-${status}`;
		alert.title = 'Click to close';
		alert.innerText = message;

		alert.addEventListener('click', (event) => {
			event.currentTarget.closed = true;
			event.currentTarget.style.opacity = '0.5';
			event.currentTarget.style.transform = 'translate(200%)';
		});

		alert.addEventListener('transitionend', (event) => {
			if (event.currentTarget.closed) {
				event.currentTarget.remove();
			}
		});

		setTimeout(() => {
			this.#removeAlert(alert);
		}, this.#FADE_TIME);

		if (this.alertsAmount >= this.#MAX_ALERTS_AMOUNT) {
			this.#removeAlert(this.#alertContainer.children[0]);
		} else {
			this.#alertContainer.insertAdjacentElement('beforeend', alert);
		}

		return this.#alertContainer.children.length - 1;
	}

	#initialiseAlertsContainer() {
		const alertContainer = document.createElement('div');
		alertContainer.className = 'alerts-container';
		document.body.insertAdjacentElement('beforeend', alertContainer);
		this.#alertContainer = alertContainer;
	}

	#removeAlert(alert) {
		if (!this.#alertContainer) return;
		alert.closed = true;
		alert.style.opacity = '0.5';
		alert.style.transform = 'translate(200%)';
	}

	run() {
		this.#initialiseAlertsContainer();
	}
}