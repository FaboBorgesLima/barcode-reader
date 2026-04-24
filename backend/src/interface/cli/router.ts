import { createInterface } from 'node:readline';
import {
  getDomain,
  getCommands,
  type Constructor,
} from '../../lib/cliDecorators';

type Handler = (args: string[]) => Promise<void>;

interface RouteEntry {
  handler: Handler;
  usage: string;
}

export class Router {
  private rl: ReturnType<typeof createInterface>;
  private routes = new Map<string, Map<string, RouteEntry>>();

  public constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  public register(controller: object): this {
    const domain = getDomain(controller.constructor as Constructor);
    if (!domain)
      throw new Error(
        `${controller.constructor.name} is missing @CliController decorator`,
      );

    const commands = getCommands(Object.getPrototypeOf(controller) as object);
    const domainMap = new Map<string, RouteEntry>();

    for (const [action, meta] of commands) {
      const ctrl = controller as Record<string, Handler>;
      domainMap.set(action, {
        handler: (args) => ctrl[meta.method](args),
        usage: meta.usage,
      });
    }

    this.routes.set(domain, domainMap);
    return this;
  }

  public start(): void {
    console.log('Barcode Scanner CLI — type "help" for commands\n');
    this.prompt();
  }

  private prompt(): void {
    this.rl.question('> ', (line) => {
      void this.dispatch(line.trim()).then(() => this.prompt());
    });
  }

  private async dispatch(line: string): Promise<void> {
    if (!line) return;
    const [domain, action, ...args] = line.split(/\s+/);

    if (domain === 'help') {
      this.printHelp();
      return;
    }
    if (domain === 'exit' || domain === 'quit') {
      this.rl.close();
      process.exit(0);
    }

    const domainMap = this.routes.get(domain);
    if (!domainMap) {
      console.error(
        `\n  Unknown domain "${domain}". Available: ${[...this.routes.keys()].join(', ')}`,
      );
      return;
    }

    const entry = domainMap.get(action);
    if (!entry) {
      console.error(
        `\n  Unknown action "${action}" for "${domain}". Available: ${[...domainMap.keys()].join(', ')}`,
      );
      return;
    }

    await entry.handler(args);
  }

  private printHelp(): void {
    const domains = [...this.routes.keys()];
    const longestUsage = Math.max(
      ...domains.flatMap((d) =>
        [...this.routes.get(d)!.values()].map((e) => e.usage.length),
      ),
    );

    console.log('');
    for (const [domain, commands] of this.routes) {
      console.log(`  ${domain}`);
      for (const entry of commands.values())
        console.log(`    ${entry.usage.padEnd(longestUsage + 2)}`);
      console.log('');
    }
    console.log(`  ${'help'.padEnd(longestUsage + 2)}`);
    console.log(`  ${'exit'.padEnd(longestUsage + 2)}\n`);
  }
}
