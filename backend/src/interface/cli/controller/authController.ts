import { DomainError } from "../../../error/domainError";
import { AuthService } from "../../../service/authService";
import { CliCommand, CliController } from "../../../lib/cliDecorators";
import { AuthView } from "../view/authView";

@CliController("auth")
export class AuthController {
    public constructor(
        private authService: AuthService,
        private view: AuthView,
    ) {}

    @CliCommand("initiate", "auth initiate <identity>")
    async initiate(args: string[]): Promise<void> {
        try {
            const [identity] = args;
            if (!identity) return this.usage("auth initiate <identity>");
            await this.authService.initiateAuth(identity);
            this.view.displayOtpInitiated(identity);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("login", "auth login <identity> <credential>")
    async login(args: string[]): Promise<void> {
        try {
            const [identity, credential] = args;
            if (!identity || !credential)
                return this.usage("auth login <identity> <credential>");
            const token = await this.authService.login(identity, credential);
            this.view.displayToken(token);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("register", "auth register <name> <identity> <credential>")
    async register(args: string[]): Promise<void> {
        try {
            const [name, identity, credential] = args;
            if (!name || !identity || !credential)
                return this.usage(
                    "auth register <name> <identity> <credential>",
                );
            const token = await this.authService.register(
                name,
                identity,
                credential,
            );
            this.view.displayToken(token);
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    @CliCommand("logout", "auth logout <token>")
    async logout(args: string[]): Promise<void> {
        try {
            const [token] = args;
            if (!token) return this.usage("auth logout <token>");
            await this.authService.logout(token);
            this.view.displayLogout();
        } catch (e) {
            this.view.displayError(
                e instanceof DomainError ? e.message : String(e),
            );
        }
    }

    private usage(syntax: string): void {
        this.view.displayError(`Usage: ${syntax}`);
    }
}
