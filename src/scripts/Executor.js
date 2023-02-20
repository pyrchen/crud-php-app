class MainExecutor {
	/** @var {string} */
	#value;

	#funcs = {};

	#prevResult = null;
	#prevRegisters = {};

	#doNextCallbacks = [];
	constructor(fn, prevRegisters = {}) {
		this.#prevRegisters = prevRegisters;
		fn(this.#next.bind(this));
	}

	get instance() {
		return this.#value;
	}

	#next(value) {
		this.#value = value;
		this.#prevResult = value;
	}

	saveCallback(callback) {
		if (!callback || !callback.name || callback.name in this.#funcs) {
			throw new Error('No callback name to save or the name is already registered');
		}
		this.#funcs[callback.name] = (...args) => callback(...args);
		return this;
	}

	doNext(onNext) {
		this.#doNextCallbacks.push(onNext);
		return this;
	}

	runNextCallbacks() {
		this.#doNextCallbacks.forEach((nextCallback) => {
			const result = nextCallback(this.#prevResult, this.#funcs, this.#prevRegisters);
			this.#prevResult = result || null;
		})
	}
}

export class Executor {
	static #executions = [];
	static #prevExecutions = {};
	static #memory = {};

	static getFromMemory(key) {
		if (!this.#memory[key]) throw new Error(`There's no "${key}" in the memory`);
		return this.#memory[key];
	}

	static remember (value, name) {
		if (!name && typeof value === "function" && value.name) {
			this.#memory[value.name] = value;
		} else if (!name && value.constructor && value.constructor.name) {
			this.#memory[value.constructor.name] = value;
		} else {
			this.#memory[name] = value;
		}
	};
	static register(key, classInstance) {
		const executor = new MainExecutor((next) => {
			next(classInstance);
		}, Executor.#prevExecutions);

		if (!Executor.#prevExecutions[key]) {
			Executor.#prevExecutions[key] = classInstance;
		}
		this.#executions.push(executor);
		return executor;
	}

	static run() {
		this.#executions.forEach((executor) => {
			const instance = executor.instance;
			if ('run' in instance && typeof instance.run === 'function') {
				instance.run();
				executor.runNextCallbacks();
			}
			if ('afterInitialise' in instance && typeof instance.afterInitialise === 'function') {
				instance.afterInitialise();
			}
		});
	}
}