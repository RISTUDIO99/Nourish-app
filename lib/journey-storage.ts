export type EnergyLevel = 'low' | 'steady' | 'bright';
export type JourneyState = Record<number, { completed: boolean; energy?: EnergyLevel }>;

type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

function parseState(raw: string | null): JourneyState {
  if (raw === null) return {};
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Saved journey could not be read.');
  }
  for (const [day, entry] of Object.entries(value)) {
    if (!/^[1-7]$/.test(day) || !entry || typeof entry !== 'object' ||
        typeof entry.completed !== 'boolean' ||
        (entry.energy !== undefined && !['low', 'steady', 'bright'].includes(entry.energy))) {
      throw new Error('Saved journey could not be read.');
    }
  }
  return value as JourneyState;
}

/** Keep writes alive across route changes; commit UI state only after storage succeeds. */
export function createJourneyStorage(storage: Storage) {
  const writes = new Map<string, Promise<JourneyState>>();
  return {
    async read(key: string): Promise<JourneyState> {
      await writes.get(key)?.catch(() => undefined);
      return parseState(await storage.getItem(key));
    },
    update(key: string, day: number, patch: Partial<JourneyState[number]>): Promise<JourneyState> {
      if (!Number.isInteger(day) || day < 1 || day > 7) {
        return Promise.reject(new Error('Invalid journey day.'));
      }
      const write = (writes.get(key) ?? Promise.resolve())
        .catch(() => undefined)
        .then(async () => {
          // Read the last durable state, not a potentially stale screen snapshot.
          const current = parseState(await storage.getItem(key));
          const next = { ...current, [day]: { ...(current[day] ?? { completed: false }), ...patch } };
          const serialized = JSON.stringify(next);
          parseState(serialized);
          await storage.setItem(key, serialized);
          return next;
        });
      writes.set(key, write);
      const cleanup = () => {
        if (writes.get(key) === write) writes.delete(key);
      };
      void write.then(cleanup, cleanup);
      return write;
    },
  };
}
