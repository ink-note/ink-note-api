export class CacheKey {
  static generateKey(entity: string, id: number | string): string {
    return `${entity}:${id}`;
  }

  static userById(userId: string) {
    return this.generateKey('user', userId);
  }

  static userByEmail(email: string) {
    return this.generateKey('user', email);
  }

  static userEmailConfirmationToken(token: string) {
    return this.generateKey('userEmailConfirmationToken', token);
  }
}
