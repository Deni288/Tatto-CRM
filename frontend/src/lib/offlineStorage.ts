const DB_NAME = 'tattoo-crm-offline';
const DB_VERSION = 1;

interface CachedAppointment {
  readonly id: string;
  readonly title: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly status: string;
  readonly clientName: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (): void => {
      const db = request.result;
      if (!db.objectStoreNames.contains('appointments')) {
        db.createObjectStore('appointments', { keyPath: 'id' });
      }
    };
    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => reject(request.error);
  });
}

export async function cacheAppointments(
  appointments: ReadonlyArray<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    client?: { firstName: string; lastName: string };
  }>,
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('appointments', 'readwrite');
  const store = tx.objectStore('appointments');

  // Only store non-PII: id, title, times, status, display name
  for (const apt of appointments) {
    const cached: CachedAppointment = {
      id: apt.id,
      title: apt.title,
      startTime: apt.startTime,
      endTime: apt.endTime,
      status: apt.status,
      clientName: apt.client
        ? `${apt.client.firstName} ${apt.client.lastName}`
        : '',
    };
    store.put(cached);
  }

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = (): void => resolve();
    tx.onerror = (): void => reject(tx.error);
  });
}

export async function getCachedAppointments(): Promise<CachedAppointment[]> {
  const db = await openDB();
  const tx = db.transaction('appointments', 'readonly');
  return new Promise((resolve, reject) => {
    const req = tx.objectStore('appointments').getAll();
    req.onsuccess = (): void => resolve(req.result as CachedAppointment[]);
    req.onerror = (): void => reject(req.error);
  });
}

export async function clearOfflineCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = (): void => resolve();
    request.onerror = (): void => reject(request.error);
  });
}
