import { SkypeClient } from './skype-client';
import { isSupportedPlatform } from './util/runtime-env';

const provider: {bindings: SkypeClient} = isSupportedPlatform() ?
    require('./sdk-bindings') :
    require('./mock-bindings');

export const client = provider.bindings;
