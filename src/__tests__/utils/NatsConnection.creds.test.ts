import { createNatsConnection } from '../../utils/NatsConnection';
import { connect, jwtAuthenticator } from 'nats';

jest.mock('nats');

describe('NatsConnection - Credentials File Support', () => {
	const mockConnect = connect as jest.MockedFunction<typeof connect>;
	const mockJwtAuthenticator = jwtAuthenticator as jest.MockedFunction<typeof jwtAuthenticator>;
	
	beforeEach(() => {
		jest.clearAllMocks();
		mockConnect.mockResolvedValue({} as any);
		mockJwtAuthenticator.mockReturnValue({} as any);
	});
	
	describe('credsFile authentication', () => {
		const validCredsFile = `-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJBQ1NFTVVBVE5MTkc1NVpXS1lFS0JYUllGREFGQzZDWDZGTjNSTEFSNzJBSDQ3TlBFUElRIiwiaWF0IjoxNjM5NTc4NjU5LCJpc3MiOiJBQ1ZXRFQzSlpBQ0EzNEFTRERVTjI0TFdEVk5RM1k0RDZVQUtKUDQ0UE5NM0FVNVVDVDQ0VjZLTSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVQVdFS01VTE5ITlNVS1pLT01HNDJDSE9JTjQ0NFE0UlBCQUtDVEJHWDNOSjRUM1FTQ1EzM1VPVSIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.SOME_SIGNATURE
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
				connectionType: 'credsFile',
				servers: 'tls://connect.ngs.global',
				credsFile: validCredsFile,
			};
			
			await createNatsConnection(credentials);
			
			expect(mockJwtAuthenticator).toHaveBeenCalledWith(
				expect.stringContaining('eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ'),
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
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJBQ1NFTVVBVE5MTkc1NVpXS1lFS0JYUllGREFGQzZDWDZGTjNSTEFSNzJBSDQ3TlBFUElRIiwiaWF0IjoxNjM5NTc4NjU5LCJpc3MiOiJBQ1ZXRFQzSlpBQ0EzNEFTRERVTjI0TFdEVk5RM1k0RDZVQUtKUDQ0UE5NM0FVNVVDVDQ0VjZLTSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVQVdFS01VTE5ITlNVS1pLT01HNDJDSE9JTjQ0NFE0UlBCQUtDVEJHWDNOSjRUM1FTQ1EzM1VPVSIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.SOME_SIGNATURE
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
------END USER NKEY SEED------
`;
			
			const credentials = {
				connectionType: 'credsFile',
				servers: 'tls://connect.ngs.global',
				credsFile: credsWithSpaces,
			};
			
			await createNatsConnection(credentials);
			
			expect(mockJwtAuthenticator).toHaveBeenCalled();
		});
		
		it('should throw error for invalid credentials file format', async () => {
			const invalidCreds = `This is not a valid credentials file`;
			
			const credentials = {
				connectionType: 'credsFile',
				servers: 'tls://connect.ngs.global',
				credsFile: invalidCreds,
			};
			
			await expect(createNatsConnection(credentials)).rejects.toThrow(
				'Invalid credentials file format'
			);
		});
		
		it('should throw error for missing JWT section', async () => {
			const missingJWT = `-----BEGIN USER NKEY SEED-----
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
------END USER NKEY SEED------`;
			
			const credentials = {
				connectionType: 'credsFile',
				servers: 'tls://connect.ngs.global',
				credsFile: missingJWT,
			};
			
			await expect(createNatsConnection(credentials)).rejects.toThrow(
				'Invalid credentials file format'
			);
		});
		
		it('should throw error for missing seed section', async () => {
			const missingSeed = `-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.SOME_JWT
------END NATS USER JWT------`;
			
			const credentials = {
				connectionType: 'credsFile',
				servers: 'tls://connect.ngs.global',
				credsFile: missingSeed,
			};
			
			await expect(createNatsConnection(credentials)).rejects.toThrow(
				'Invalid credentials file format'
			);
		});
		
		it('should work with Synadia Cloud NGS URLs', async () => {
			const credentials = {
				connectionType: 'credsFile',
				servers: 'tls://connect.ngs.global,tls://connect.ngs.global:7422',
				credsFile: validCredsFile,
			};
			
			await createNatsConnection(credentials);
			
			expect(mockConnect).toHaveBeenCalledWith(
				expect.objectContaining({
					servers: ['tls://connect.ngs.global', 'tls://connect.ngs.global:7422'],
				})
			);
		});
	});
});