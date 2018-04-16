'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const EventEmitter = require('events');
const makeDir = require('make-dir');
const pkgUp = require('pkg-up');
const envPaths = require('env-paths');
const writeFileAtomic = require('write-file-atomic');

const plainObject = () => Object.create(null);

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename];
const parentDir = path.dirname((module.parent && module.parent.filename) || '.');

class Conf {
	constructor(options) {
		const pkgPath = pkgUp.sync(parentDir);

		options = Object.assign({
			// Can't use `require` because of Webpack being annoying:
			// https://github.com/webpack/webpack/issues/196
			projectName: pkgPath && JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name
		}, options);

		if (!options.projectName && !options.cwd) {
			throw new Error('Project name could not be inferred. Please specify the `projectName` option.');
		}

		options = Object.assign({
			configName: 'config'
		}, options);

		if (!options.cwd) {
			options.cwd = envPaths(options.projectName).config;
		}

		this.events = new EventEmitter();
		this.path = path.resolve(options.cwd, `${options.configName}.json`);
		this.store = Object.assign(plainObject(), options.defaults, this.store);
	}

	get(key, defaultValue) {
		return (this.store)[key] || defaultValue;
	}

	set(key, value) {
		if (typeof key !== 'string') {
			throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof key}`);
		}

		if (value === undefined) {
			throw new TypeError('Use `delete()` to clear values');
		}

		const {store} = this;

		if (typeof key === 'object') {
			for (const k of Object.keys(key)) {
				store[k] = key[k];
			}
		} else {
			store[key] = value;
		}

		this.store = store;
	}

	has(key) {
		return this.store[key] !== undefined;
	}

	delete(key) {
		const {store} = this;
		delete store[key];
		this.store = store;
	}

	clear() {
		this.store = plainObject();
	}

	onDidChange(key, callback) {
		if (typeof key !== 'string') {
			throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof key}`);
		}

		if (typeof callback !== 'function') {
			throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
		}

		let currentValue = this.get(key);

		const onChange = () => {
			const oldValue = currentValue;
			const newValue = this.get(key);

			try {
				// TODO: Use `util.isDeepStrictEqual` when targeting Node.js 10
				assert.deepEqual(newValue, oldValue);
			} catch (_) {
				currentValue = newValue;
				callback.call(this, newValue, oldValue);
			}
		};

		this.events.on('change', onChange);
		return () => this.events.removeListener('change', onChange);
	}

	get size() {
		return Object.keys(this.store).length;
	}

	get store() {
		try {
			const data = fs.readFileSync(this.path, 'utf8');
			return Object.assign(plainObject(), JSON.parse(data));
		} catch (error) {
			if (error.code === 'ENOENT') {
				makeDir.sync(path.dirname(this.path));
				return plainObject();
			}

			if (error.name === 'SyntaxError') {
				return plainObject();
			}

			throw error;
		}
	}

	set store(value) {
		// Ensure the directory exists as it could have been deleted in the meantime
		makeDir.sync(path.dirname(this.path));

		const data = JSON.stringify(value, null, '\t');

		writeFileAtomic.sync(this.path, data);
		this.events.emit('change');
	}

	// TODO: Use `Object.entries()` when targeting Node.js 8
	* [Symbol.iterator]() {
		const {store} = this;

		for (const key of Object.keys(store)) {
			yield [key, store[key]];
		}
	}
}

module.exports = Conf;
