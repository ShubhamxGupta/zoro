import crypto from 'node:crypto';

export class SecretsManager {
  private readonly secrets = new Map<string, string>();
  private readonly encryptionKey: Buffer;

  constructor(secretKeySeed = 'repo-intel-master-secret-key-32b') {
    this.encryptionKey = crypto.createHash('sha256').update(secretKeySeed).digest();
  }

  public setSecret(key: string, value: string): void {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, this.encryptionKey.subarray(0, 16));
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.secrets.set(key, encrypted);
  }

  public getSecret(key: string): string | undefined {
    const encrypted = this.secrets.get(key);
    if (!encrypted) return undefined;

    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, this.encryptionKey.subarray(0, 16));
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return undefined;
    }
  }

  public getMaskedSecret(key: string): string {
    const secret = this.getSecret(key);
    if (!secret) return '********';
    if (secret.length <= 4) return '****';
    return secret.substring(0, 3) + '...' + secret.substring(secret.length - 2);
  }
}
