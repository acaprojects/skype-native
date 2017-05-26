import { sync, async } from './binder';
import 'mocha';
import { expect } from 'chai';

describe('sync()', () => {
    it('support binding to CLR that\'s compiled on the fly', () => {
        const identity = sync<number, number>({
            source: 'src/bindings/TestBinding.cs',
            typeName: 'Test.TestBinding',
            methodName: 'Identity'
        });

        const input = Math.random();
        const result = identity(input);

        expect(result).to.equal(input);
    });

    it('supports binding to precompiled assemblies', () => {
        if (process.platform === 'win32') {
            const identity = sync<number, number>({
                assemblyFile: 'lib/native/win32/SkypeClient.dll',
                typeName: 'Test.TestBinding',
                methodName: 'Identity'
            });

            const input = Math.random();
            const result = identity(input);

            expect(result).to.equal(input);
        } else {
            this.skip();
        }
    });
});

describe('async()', () => {

    it('support binding to CLR that\'s compiled on the fly', (done) => {
        const identity = async<number, number>({
            source: 'src/bindings/TestBinding.cs',
            typeName: 'Test.TestBinding',
            methodName: 'Identity'
        });

        const input = Math.random();

        identity(input)
            .then((result: any) => {
                if (result === input) {
                    done();
                } else {
                    done('Unexpected result returned');
                }
            })
            .catch(done);
    });

    it('supports binding to precompiled assemblies', (done) => {
        if (process.platform === 'win32') {
            const identity = async<number, number>({
                assemblyFile: 'lib/native/win32/SkypeClient.dll',
                typeName: 'Test.TestBinding',
                methodName: 'Identity'
            });

            const input = Math.random();

            identity(input)
                .then((result: any) => {
                    if (result === input) {
                        done();
                    } else {
                        done('Unexpected result returned');
                    }
                })
                .catch(done);
        } else {
            this.skip();
        }
    });
});
