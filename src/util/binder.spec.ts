
import * as binder from './binder';
import { expect } from 'chai';

describe('bindToCLR()', () => {
    it('support binding to CLR actions', () => {
        const unit = binder.bindToCLR<binder.SyncBinding>('src/bindings/TestBinding.cs');
        const input = 'Hello .NET';
        expect(unit(input, true)).to.equal(input);
    });
});
