## Latest

## 5.0.0-0 PREMAJOR

- Update Orizuru to use a class for the transport layer.
	- Each server, publisher and handler should have a different transport instance.
	- The configuration for the transport can be provided in the constructor therrby removing the requirement of transportConfig from Orizuru.
- Update all references to the Orizuru.Options; use Orizuru.Transport... instead.
- Remove the use of Orizuru.Transport.IConnect.
- Remove the Orizuru dev dependency.

- Add nyc.opts file to clean up the package.json.
