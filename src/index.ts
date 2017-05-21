import { MockClient } from './mock-client';
import { LiveClient } from './live-client';
import { SkypeClient } from './skype-client';
import { isSupportedPlatform, useMock } from './binder/runtime-env';

const client = useMock() || !isSupportedPlatform() ? MockClient : LiveClient;

export const skype: SkypeClient = new client();
