export type AdzanEvent = "adzan:start" | "adzan:end" | "adzan:stop" | "iqomah:start" | "iqomah:end";

type Listener<T = unknown> = (payload: T) => void;

class AdzanEventEmitter {
  private listeners: Map<AdzanEvent, Set<Listener>> = new Map();

  on<T>(event: AdzanEvent, listener: Listener<T>) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as Listener);
    return () => this.off(event, listener);
  }

  off<T>(event: AdzanEvent, listener: Listener<T>) {
    this.listeners.get(event)?.delete(listener as Listener);
  }

  emit<T>(event: AdzanEvent, payload?: T) {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

export const adzanEvents = new AdzanEventEmitter();
