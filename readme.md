# dotless-conf [![Build Status: Linux and macOS](https://travis-ci.org/dawsbot/dotless-conf.svg?branch=master)](https://travis-ci.org/dawsbot/dotless-conf)

> Hard fork of sindresorhus's "conf" in order to remove dot props

> Simple config handling for your app or module

All you have to care about is what to persist. This module will handle all the dull details like where and how.

## Install

```
$ npm install --save dotless-conf
```


## Usage

```js
const Conf = require('dotless-conf');
const config = new Conf();

config.set('unicorn', '🦄');
console.log(config.get('unicorn'));
//=> '🦄'

// use dot-notation to access nested properties
config.set('foo.bar', true);
console.log(config.get('foo'));
//=> {bar: true}

config.delete('unicorn');
console.log(config.get('unicorn'));
//=> undefined
```

## Why diverge from conf?

When reading and writing an object to a file, you don't always want to support nested object properties

```js
// with "conf"
// use dot-notation to access nested properties
config.set('foo.bar', true);
console.log(config.get('foo'));
//=> {bar: true}

// with "dotless-conf"
config.set('foo.bar', true);
console.log(config.get('foo'));
//=> undefined
console.log(config.get('foo.bar'));
//=> true
```

## API

### Conf([options])

Returns a new instance.

### options

#### defaults

Type: `Object`

Default config.

#### configName

Type: `string`<br>
Default: `config`

Name of the config file (without extension).

Useful if you need multiple config files for your app or module. For example, different config files between two major versions.

#### projectName

Type: `string`<br>
Default: The `name` field in your package.json

You only need to specify this if you don't have a package.json file in your project.

#### cwd

Type: `string`<br>
Default: System default [user config directory](https://github.com/dawsonbotsford/env-paths#pathsconfig)

**You most likely don't need this.**

Overrides `projectName`.

The only use-case I can think of is having the config located in the app directory or on some external storage.

### Instance

The instance is [`iterable`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) so you can use it directly in a [`for…of`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) loop.

#### .set(key, value)

Set an item.

#### .set(object)

Set multiple items at once.

#### .get(key)

Get an item.

#### .has(key)

Check if an item exists.

#### .delete(key)

Delete an item.

#### .clear()

Delete all items.

#### .size

Get the item count.

#### .store

Get all the config as an object or replace the current config with an object:

```js
conf.store = {
	hello: 'world'
};
```

#### .path

Get the path to the config file.

## Related

- [conf](https://github.com/sindresorhus/conf)

## License

MIT © [Dawson Botsford](https://dawsonbotsford.com)
