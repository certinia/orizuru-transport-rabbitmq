/**
 * Copyright (c) 2018 FinancialForce.com, inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 *   are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 * - Neither the name of the FinancialForce.com, inc nor the names of its contributors
 *      may be used to endorse or promote products derived from this software without
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 *  THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 *  OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import chai from 'chai';

import configValidator from '../../src/index/configValidator';

const expect = chai.expect;

describe('index/configValidator.ts', () => {

	describe('should reject', () => {

		it('if the options are undefined', () => {

			// Given
			// When
			// Then
			expect(() => configValidator(undefined as any)).to.throw('Invalid parameter: null options.');

		});

		it('if the options url is undefined', () => {

			// Given
			// When
			// Then
			expect(() => configValidator({ url: undefined } as any)).to.throw('Invalid parameter: url not a string.');

		});

		it('if the options url is not a string', () => {

			// Given
			// When
			// Then
			expect(() => configValidator({ url: 2 } as any)).to.throw('Invalid parameter: url not a string.');

		});

	});

	describe('should resolve', () => {

		it('if the options are valid', () => {

			// Given
			// When
			// Then
			expect(configValidator({ url: 'testing' })).to.not.throw;

		});

	});

});
