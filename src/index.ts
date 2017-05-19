import { client as mock } from './mock-bindings';
import { client as live } from './sdk-bindings';
import { SkypeClient } from './skype-client';
import { isSupportedPlatform, useMock } from './util/runtime-env';

export const skype = useMock() || !isSupportedPlatform() ? mock : live;
