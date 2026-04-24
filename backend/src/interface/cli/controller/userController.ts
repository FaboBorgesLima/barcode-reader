import { DomainError } from '../../../error/domainError';
import { UserService } from '../../../service/userSerivice';
import { CliCommand, CliController } from '../../../lib/cliDecorators';
import { UserView } from '../view/userView';

@CliController('user')
export class UserController {
  public constructor(
    private userService: UserService,
    private view: UserView,
  ) {}

  @CliCommand('get', 'user get <id>')
  async get(args: string[]): Promise<void> {
    try {
      const [id] = args;
      if (!id) return this.usage('user get <id>');
      const user = await this.userService.getUserById(id);
      if (!user) return this.view.displayError('User not found');
      this.view.displayUser(user);
    } catch (e) {
      this.view.displayError(e instanceof DomainError ? e.message : String(e));
    }
  }

  @CliCommand('update', 'user update <id> <name>')
  async update(args: string[]): Promise<void> {
    try {
      const [id, name] = args;
      if (!id || !name) return this.usage('user update <id> <name>');
      const updated = await this.userService.updateUser(id, name);
      this.view.displayUpdated(updated);
    } catch (e) {
      this.view.displayError(e instanceof DomainError ? e.message : String(e));
    }
  }

  private usage(syntax: string): void {
    this.view.displayError(`Usage: ${syntax}`);
  }
}
