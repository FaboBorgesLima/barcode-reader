export class AuthView {
    displayOtpInitiated(identity: string): void {
        console.log(`\n  OTP sent to "${identity}"`);
    }

    displayToken(token: string): void {
        console.log(`\n  Token: ${token}`);
    }

    displayLogout(): void {
        console.log("\n  Logged out successfully");
    }

    displayError(message: string): void {
        console.error(`\n  Error: ${message}`);
    }
}
