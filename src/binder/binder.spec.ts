
import { bindToCLR, createBindingEnv, SyncBinding, AsyncBinding } from './binder';
import 'mocha';
import { expect } from 'chai';

describe('bindToCLR()', () => {
    it('support binding to CLR actions', () => {
        // TestBinding contains a simple identity function
        const identity = bindToCLR<SyncBinding>('src/bindings/TestBinding.cs', [], 'TestBinding');

        const input = Math.random();

        const result = identity(input, true);

        expect(result).to.equal(input);
    });
});

describe('createBindingEnv()', () => {

    const bindToEnv = createBindingEnv('src/bindings');

    it('creates synchronous CLR bindings', () => {
        const identity = bindToEnv.sync('TestBinding');

        const input = Math.random();

        const result = identity(input);

        expect(result).to.equal(input);
    });

    it('creates asynchronous CLR bindings', (done) => {
        const identity = bindToEnv.async('TestBinding');

        const input = Math.random();

        identity(input, (err, result) => {
            if (err) {
                done(err);
            } else if (result === input) {
                done();
            } else {
                done('Unexpected result returned');
            }
        });
    });
});
