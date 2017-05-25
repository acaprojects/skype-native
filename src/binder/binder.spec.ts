import { bindToCLR, SyncBinding, AsyncBinding, createBinder, PrecompiledTarget } from './binder';
import 'mocha';
import { expect } from 'chai';

describe('bindToCLR()', () => {
    it('support binding to CLR that\'s compiled on the fly', () => {
        const identity = bindToCLR<SyncBinding<number, number>>({
            source: 'src/bindings/TestBinding.cs',
            typeName: 'Test.TestBinding',
            methodName: 'Identity'
        });

        const input = Math.random();
        const result = identity(input, true);

        expect(result).to.equal(input);
    });

    it('supports binding to precompiled assemblies', () => {
        if (process.platform === 'win32') {
            const identity = bindToCLR<SyncBinding<number, number>>({
                assemblyFile: 'lib/native/win32/SkypeClient.dll',
                typeName: 'Test.TestBinding',
                methodName: 'Identity'
            });

            const input = Math.random();
            const result = identity(input, true);

            expect(result).to.equal(input);
        } else {
            this.skip();
        }
    });
});

describe('createBinder()', () => {

    const binder = createBinder<PrecompiledTarget>({
        assemblyFile: 'lib/native/win32/SkypeClient.dll',
        typeName: 'Test.TestBinding'
    });

    it('creates synchronous CLR bindings', () => {
        const identity = binder.sync<number, number>({methodName: 'Identity'});

        const input = Math.random();
        const result = identity(input);

        expect(result).to.equal(input);
    });

    it('creates asynchronous CLR bindings', (done) => {
        const identityAsync = binder.async<number, number>({methodName: 'Identity'});

        const input = Math.random();

        identityAsync(input)
            .then((result: any) => {
                if (result === input) {
                    done();
                } else {
                    done('Unexpected result returned');
                }
            })
            .catch(done);
    });

});
