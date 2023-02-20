const REG_PATTERNS = {
	EMAIL: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	ENGLISH: /^[A-Za-z][A-Za-z0-9]*$/,
	NO_FORBIDDEN_CHARS: /^[A-Za-z_-][A-Za-z0-9]*$/,
}

const lengthConstraint = ({ min, max }, messageOnMin = '', messageOnMax = '') => addConstraint((value) => {
	if (!value || value.length < min) return constraintResult(false, (valueLength, min) => {
		return messageOnMin || `Length should be greater than ${min - 1} symbols. Entered: ${valueLength}`;
	}, [value.length, min]);
	if (value.length > max) {
		return constraintResult(false, (valueLength, max) => {
			return messageOnMax || `Length should be lower than ${max + 1}. Entered: ${valueLength}`;
		}, [value.length, max]);
	}
	return constraintResult(true);
});

const patternConstraint = (regExp, message) => addConstraint((value) => {
	const reg = new RegExp(regExp, 'gi');
	if (!value || !reg.test(value)) {
		return constraintResult(false, message || 'String contains forbidden symbols');
	}
	return constraintResult(true);
});

const confirmConstraint = (message) => addConstraint((value, { password }) => {
	if (password === null || password === undefined) throw new Error('No password to validate confirm value');
	if (value !== password) return constraintResult(false, message || `Password isn't confirmed`);
	return constraintResult(true);
});

const CONSTRAINTS = {
	login: {
		length: lengthConstraint({ min: 4, max: 16 }),
		pattern: patternConstraint(REG_PATTERNS.NO_FORBIDDEN_CHARS),
		languagePattern: patternConstraint(REG_PATTERNS.ENGLISH, 'String should be in English'),
	},
	name: {
		length: lengthConstraint({ min: 2, max: 20 }),
		pattern: patternConstraint(REG_PATTERNS.NO_FORBIDDEN_CHARS),
		languagePattern: patternConstraint(REG_PATTERNS.ENGLISH, 'String should be in English'),
	},
	email: {
		pattern: patternConstraint(REG_PATTERNS.EMAIL, 'Enter a valid email address'),
	},
	password: {
		length: lengthConstraint({ min: 6, max: 32 }),
	},
	confirm: {
		_required: ['password'],
		length: lengthConstraint({ min: 6, max: 32 }),
		confirmed: confirmConstraint(),
	},
};

function addConstraint(cb, cbArgs = []) {
	return (value, requiredValues) => {
		if (requiredValues) return cb(value, requiredValues);
		return cb(value);
	};
}

function constraintResult(isValid, message, messageArgs) {
	const returnObject = { isValid };
	if (!isValid) Object.assign(returnObject, {
		message: typeof message === 'function' ? message(...messageArgs) : message,
	});
	return returnObject;
}

export class IValidation {
	/**
	 * @param key {string}
	 * @param value {string}
	 * @param additionalFields {Object}
	 * @returns {{
	 *     isValid: boolean,
	 *     message: string,
	 * }}
	 */
	validateValue(key, value, additionalFields = {}) {}
}

export class Validation {
	#rules;
	constructor(fields = []) {
		if (fields.length) this.#rules = {};
		this.#rules = fields.reduce((acc, key) => {
			if (CONSTRAINTS[key]) acc[key] = CONSTRAINTS[key];
			return acc;
		}, {});
	}
	validateValue(key, value, additionalFields = {}) {
		if (!CONSTRAINTS[key]) return true;
		return this.#validateConstraint(value, CONSTRAINTS[key], additionalFields);
	}

	#validateConstraint(value, constraintObj, additionalFields) {
		let requiredAdditionalValues = {};
		if (constraintObj._required && constraintObj._required.length) {
			constraintObj._required.forEach((key) => {
				if (key in additionalFields) requiredAdditionalValues[key] = additionalFields[key];
			});
		}
		for (const constraintRuleName in constraintObj) {
			if (constraintRuleName[0] === '_') continue;
			const constraintRule = constraintObj[constraintRuleName];
			const result = {
				rule: constraintRuleName,
				...constraintRule(value, constraintObj._required ? requiredAdditionalValues : null)
			};
			if (!result.isValid) return result;
		}
		return constraintResult(true);
	}
}