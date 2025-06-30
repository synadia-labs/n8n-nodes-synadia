import { createNatsConnection } from '../../utils/NatsConnection';
import { connect, credsAuthenticator } from '../../bundled/nats-bundled';

jest.mock('../../bundled/nats-bundled', () => ({
  connect: jest.fn(),
  credsAuthenticator: jest.fn(),
}));

describe('NatsConnection - Credentials File Support', () => {
	const mockConnect = connect as jest.MockedFunction<typeof connect>;
	const mockCredsAuthenticator = credsAuthenticator as jest.MockedFunction<typeof credsAuthenticator>;
	
	const mockLogger = {
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
		debug: jest.fn(),
	};
	
	beforeEach(() => {
		jest.clearAllMocks();
		mockConnect.mockResolvedValue({} as any);
		mockCredsAuthenticator.mockReturnValue({} as any);
	});
	
	describe('creds authentication', () => {
		const validCredsFile = `-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJBQ1NFTVVBVE5MTkc1NVpXS1lFK0JYUllGREFGQzZDWDZGTjNSTEFSNzJBSDQ3TlBFUElRIiwiaWF0IjoxNjM5NTc4NjU5LCJpc3MiOiJBQ1ZXRFQzSlpBQ0EzNEFTRERVTjI0TFdEVk5RM1k0RDZVQUtKUDQ0UE5NM0FVNVVDVDQ0VjZLTSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVQVdFK01VTE5ITlNVS1pLT01HNDJDSE9JTjQ0NFE0UlBCQUtDVEJHWDNOSjRUM1FTQ1EzM1VPVSIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.SOME_SIGNATURE
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
------END USER NKEY SEED------

*************************************************************`;
		
		it('should parse valid credentials file', async () => {
			const credentials = {
				url: 'tls://connect.ngs.global',
				authenticationType: 'creds',
				credsFile: validCredsFile,
			};
			
			await createNatsConnection(credentials, mockLogger);
			
			expect(mockCredsAuthenticator).toHaveBeenCalledWith(
				expect.any(Uint8Array)
			);
			
			expect(mockConnect).toHaveBeenCalledWith(
				expect.objectContaining({
					servers: ['tls://connect.ngs.global'],
					authenticator: expect.anything(),
				})
			);
		});
		
		it('should handle credentials file with extra whitespace', async () => {
			const credsWithSpaces = `
-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJBQ1NFTVVBVE5MTkc1NVpXS1lFK0JYUllGREFGQzZDWDZGTjNSTEFSNzJBSDQ3TlBFUElRIiwiaWF0IjoxNjM5NTc4NjU5LCJpc3MiOiJBQ1ZXRFQzSlpBQ0EzNEFTRERVTjI0TFdEVk5RM1k0RDZVQUtKUDQ0UE5NM0FVNVVDVDQ0VjZLTSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVQVdFK01VTE5ITlNVS1pLT01HNDJDSE9JTjQ0NFE0UlBCQUtDVEJHWDNOSjRUM1FTQ1EzM1VPVSIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.SOME_SIGNATURE
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
------END USER NKEY SEED------
`;
			
			const credentials = {
				url: 'tls://connect.ngs.global',
				authenticationType: 'creds',
				credsFile: credsWithSpaces,
			};
			
			await createNatsConnection(credentials, mockLogger);
			
			expect(mockCredsAuthenticator).toHaveBeenCalled();
		});
		
		it('should handle invalid credentials file by letting credsAuthenticator handle it', async () => {
			const invalidCreds = `This is not a valid credentials file`;
			
			const credentials = {
				url: 'tls://connect.ngs.global',
				authenticationType: 'creds',
				credsFile: invalidCreds,
			};
			
			// The credsAuthenticator will handle invalid formats internally
			await createNatsConnection(credentials, mockLogger);
			
			expect(mockCredsAuthenticator).toHaveBeenCalledWith(
				expect.any(Uint8Array)
			);
		});
		
		it('should handle missing JWT section by letting credsAuthenticator handle it', async () => {
			const missingJWT = `-----BEGIN USER NKEY SEED-----
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
------END USER NKEY SEED------`;
			
			const credentials = {
				url: 'tls://connect.ngs.global',
				authenticationType: 'creds',
				credsFile: missingJWT,
			};
			
			// The credsAuthenticator will handle missing sections internally
			await createNatsConnection(credentials, mockLogger);
			
			expect(mockCredsAuthenticator).toHaveBeenCalledWith(
				expect.any(Uint8Array)
			);
		});
		
		it('should handle missing seed section by letting credsAuthenticator handle it', async () => {
			const missingSeed = `-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.SOME_JWT
------END NATS USER JWT------`;
			
			const credentials = {
				url: 'tls://connect.ngs.global',
				authenticationType: 'creds',
				credsFile: missingSeed,
			};
			
			// The credsAuthenticator will handle missing sections internally
			await createNatsConnection(credentials, mockLogger);
			
			expect(mockCredsAuthenticator).toHaveBeenCalledWith(
				expect.any(Uint8Array)
			);
		});
		
		it('should work with Synadia Cloud NGS URLs', async () => {
			const credentials = {
				url: 'tls://connect.ngs.global',
				authenticationType: 'creds',
				credsFile: validCredsFile,
			};
			
			await createNatsConnection(credentials, mockLogger);
			
			expect(mockConnect).toHaveBeenCalledWith(
				expect.objectContaining({
					servers: ['tls://connect.ngs.global'],
				})
			);
		});
	});
});