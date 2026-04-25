import { Logger } from '@nestjs/common';
import { DomainError } from '../error/domainError';
import { User } from '../model/user';
import { UserRepository } from '../repository/userRepository';
import { AuthStrategy } from './authStrategy';
import { TokenService } from './tokenService';

export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public constructor(
    protected userRepository: UserRepository,
    protected authStrategy: AuthStrategy,
    protected tokenService: TokenService,
  ) {}

  public async initiateAuth(identity: string): Promise<void> {
    this.logger.log(`Initiating auth for ${identity}`);
    await this.authStrategy.initiate(identity);
  }

  public getGenericError(): DomainError {
    return new DomainError('Credential Expired or Invalid', 401);
  }

  public async login(email: string, credential: string): Promise<string> {
    if (!(await this.authStrategy.verify(email, credential))) {
      this.logger.warn(`Login failed for ${email}: invalid credential`);
      throw this.getGenericError();
    }

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed for ${email}: user not found`);
      throw this.getGenericError();
    }

    await this.authStrategy.consume(email);
    this.logger.log(`Login successful for ${email} (userId=${user.id})`);

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
    if (!(await this.authStrategy.verify(email, credential))) {
      this.logger.warn(`Registration failed for ${email}: invalid credential`);
      throw this.getGenericError();
    }

    const existing = await this.userRepository.getUserByEmail(email);
    if (existing) {
      this.logger.warn(
        `Registration failed for ${email}: email already in use`,
      );
      throw this.getGenericError();
    }

    await this.authStrategy.consume(email);

    const created = await this.userRepository.createUser(
      new User(undefined, name, email),
    );
    this.logger.log(
      `Registration successful for ${email} (userId=${created.id})`,
    );

    return this.tokenService.generateToken({
      userId: created.id!,
      email: created.email,
    });
  }

  public async logout(token: string): Promise<void> {
    this.logger.log('User logout: revoking token');
    await this.tokenService.revokeToken(token);
  }
}
