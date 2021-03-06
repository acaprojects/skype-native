# Skype-Native

[![Build Status](https://travis-ci.org/acaprojects/skype-native.svg?branch=master)](https://travis-ci.org/acaprojects/skype-native)
[![Code Climate](https://codeclimate.com/github/acaprojects/skype-native/badges/gpa.svg)](https://codeclimate.com/github/acaprojects/skype-native)
[![Dependencies Status](https://david-dm.org/acaprojects/skype-native/status.svg)](https://david-dm.org/acaprojects/skype-native)
[![npm version](https://badge.fury.io/js/skype-native.svg)](https://badge.fury.io/js/skype-native)

Node bindings for control and interaction with the Skype for Business / Lync desktop client.

>Note: initial structuring of the project is still taking place. Prior to v1.0.0 expect any exposed API's to break. A lot.


## Requirements

- a locally installed Skype for Business or Lync client
- Windows

This library uses the Windows native Lync 2013 App SDK to provide control and integration with the desktop client. The is compatabile with the Lync 2013, Skype for Business 2015 and Skype for Business 2016 clients.

If a valid environment is not detected, a mocked client will be presented. This may be used for development under Linux and MacOS.

The mocked client may also be forced by setting `MOCK_SKYPE_CLIENT` environment variable.


## Usage

Import the `skype` object from the published package.

Javascript:
```javascript
const { skype } = require('skype-native');
```

Typescript / ES6:
```typescript
import { skype } from 'skype-native';
```
*Types are bundled with the published package and will be automatically imported.*

