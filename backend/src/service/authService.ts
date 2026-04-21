import { DomainError } from "../error/domainError";
import { User } from "../model/user";
import { UserRepository } from "../repository/userRepository";
import { AuthStrategy } from "./authStrategy";
import { TokenService } from "./tokenService";

export class AuthService {
    public constructor(
        protected userRepository: UserRepository,
        protected authStrategy: AuthStrategy,
        protected tokenService: TokenService,
    ) {}

    public async initiateAuth(identity: string): Promise<void> {
        await this.authStrategy.initiate(identity);
    }

    public getGenericError(): DomainError {
        return new DomainError("Credential Expired or Invalid", 401);
    }

    public async login(email: string, credential: string): Promise<string> {
        if (!(await this.authStrategy.verify(email, credential)))
            throw this.getGenericError();

        const user = await this.userRepository.getUserByEmail(email);
        if (!user) throw this.getGenericError();

        await this.authStrategy.consume(email);

        return this.tokenService.generateToken({
            userId: user.id!,
            email: user.email,
        });
    }

    public async register(
        name: string,
        email: string,
        credential: string,
    ): Promise<string> {
        if (!(await this.authStrategy.verify(email, credential)))
            throw this.getGenericError();

        const existing = await this.userRepository.getUserByEmail(email);
        if (existing) throw this.getGenericError();

        await this.authStrategy.consume(email);

        const created = await this.userRepository.createUser(
            new User(undefined, name, email),
        );

        return this.tokenService.generateToken({
            userId: created.id!,
            email: created.email,
        });
    }

    public async logout(token: string): Promise<void> {
        await this.tokenService.revokeToken(token);
    }
}
