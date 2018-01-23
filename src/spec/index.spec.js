/**
 * Copyright (c) 2017-2018 FinancialForce.com, inc
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
 **/

'use strict';

const
	root = require('app-root-path'),
	sinon = require('sinon'),
	proxyquire = require('proxyquire'),

	{ calledOnce, calledWith } = sinon.assert,

	sandbox = sinon.sandbox.create(),
	restore = sandbox.restore.bind(sandbox);

describe('index.js', () => {

	afterEach(restore);

	it('should load and expose apis correctly', () => {

		// given
		const
			mockPublish = { send: sandbox.spy() },
			mockSubscribe = { handle: sandbox.spy() },
			index = proxyquire(root + '/src/lib/index', {
				['./index/publish']: mockPublish,
				['./index/subscribe']: mockSubscribe
			});

		// when
		index.publish('test1');
		index.subscribe('test2');

		// then
		calledOnce(mockPublish.send);
		calledWith(mockPublish.send, 'test1');
		calledOnce(mockSubscribe.handle);
		calledWith(mockSubscribe.handle, 'test2');

	});

});
