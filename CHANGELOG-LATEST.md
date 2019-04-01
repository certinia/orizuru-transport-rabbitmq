# @financialforcedev/orizuru-transport-rabbitmq

## Latest changes (not yet released)
- Update `Transport.close()` function to close channels. Close function has a new optional parameter `options: {flush: boolean}` set to false by default. If `options.flush` is set to true then channels are closed. 
