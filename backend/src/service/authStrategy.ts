export interface AuthStrategy {
  initiate(identity: string): Promise<void>;
  verify(identity: string, credential: string): Promise<boolean>;
  consume(identity: string): Promise<void>;
}
