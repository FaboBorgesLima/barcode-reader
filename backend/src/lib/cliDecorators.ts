// WeakMap-based metadata registry — no reflect-metadata dependency needed
type Constructor = abstract new (...args: unknown[]) => unknown;

const domainRegistry = new WeakMap<Constructor, string>();

interface CommandMeta {
  method: string;
  usage: string;
}

const commandRegistry = new WeakMap<object, Map<string, CommandMeta>>();

export function CliController(domain: string) {
  return (target: new (...args: any[]) => any): void => {
    domainRegistry.set(target, domain);
  };
}

export function CliCommand(action: string, usage: string) {
  return (target: object, propertyKey: string): void => {
    const map = commandRegistry.get(target) ?? new Map<string, CommandMeta>();
    map.set(action, { method: propertyKey, usage });
    commandRegistry.set(target, map);
  };
}

export function getDomain(ctor: Constructor): string | undefined {
  return domainRegistry.get(ctor);
}

export function getCommands(proto: object): Map<string, CommandMeta> {
  return commandRegistry.get(proto) ?? new Map<string, CommandMeta>();
}
