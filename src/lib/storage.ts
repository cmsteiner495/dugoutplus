const memoryStore = new Map<string, string>();

export const storage = {
  async getItem(key: string) {
    return memoryStore.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    memoryStore.set(key, value);
  },
  async removeItem(key: string) {
    memoryStore.delete(key);
  },
};
