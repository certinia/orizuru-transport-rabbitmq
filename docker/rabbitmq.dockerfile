#
# Copyright (c) 2019, FinancialForce.com, inc
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without modification,
#   are permitted provided that the following conditions are met:
#
# - Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
# - Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
# - Neither the name of the FinancialForce.com, inc nor the names of its contributors
#      may be used to endorse or promote products derived from this software without
#      specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
#  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
#  THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
#  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
#  OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
#  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
#  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

# Start with rabbitmq:management as the root image
FROM rabbitmq:management

# Install OpenSSL
RUN apt-get update \
	&& apt-get install openssl -y;

# Make the certificates directory and add the server certificate generator file
RUN mkdir certificates
ADD ./setup/certificate.conf certificates/certificate.conf

# Generate a CA key
RUN openssl genrsa -out certificates/ca-key.pem 

# Generate the CA - use the certificate.conf
RUN openssl req -new -x509 -days 365 -key certificates/ca-key.pem -out certificates/ca.pem -config certificates/certificate.conf

# Generate a key for the server certificate
RUN openssl genrsa -out certificates/server-key.pem

# Generate a certificate signing request
RUN openssl req -subj "/CN=localhost" -sha256 -new -key certificates/server-key.pem -out certificates/server.csr

# Generate a server certificate w/ appropriate options - will ask for passphrase
RUN echo subjectAltName = IP:127.0.0.1 > certificates/extfile.cnf
RUN openssl x509 -req -days 365 -sha256 -in certificates/server.csr -CA certificates/ca.pem -CAkey certificates/ca-key.pem -CAcreateserial -out certificates/server-cert.pem -extfile certificates/extfile.cnf

# Copy the configuration file
COPY setup/rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

# Start the service
CMD rabbitmq-server
