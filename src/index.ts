import { SkypeClient } from './skype-client';
import { isSupportedPlatform } from './util/runtime-env';

const bindings: SkypeClient = isSupportedPlatform() ?
    require('./sdk-bindings') :
    require('./mock-bindings');

module.exports = bindings;
