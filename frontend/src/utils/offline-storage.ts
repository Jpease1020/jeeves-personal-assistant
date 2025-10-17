// Offline Storage Manager for PWA
export class OfflineStorageManager {
    private dbName = 'PersonalAssistantDB';
    private dbVersion = 1;
    private db: IDBDatabase | null = null;

    constructor() {
        this.initDatabase();
    }

    // Initialize IndexedDB
    private async initDatabase() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Offline Storage: Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ Offline Storage: Database opened successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create habits store
                if (!db.objectStoreNames.contains('habits')) {
                    const habitsStore = db.createObjectStore('habits', { keyPath: 'id' });
                    habitsStore.createIndex('userId', 'userId', { unique: false });
                    habitsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Create routine logs store
                if (!db.objectStoreNames.contains('routineLogs')) {
                    const routineStore = db.createObjectStore('routineLogs', { keyPath: 'id' });
                    routineStore.createIndex('userId', 'userId', { unique: false });
                    routineStore.createIndex('date', 'date', { unique: false });
                }

                // Create offline actions store
                if (!db.objectStoreNames.contains('offlineActions')) {
                    const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
                    actionsStore.createIndex('type', 'type', { unique: false });
                    actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                console.log('✅ Offline Storage: Database schema created');
            };
        });
    }

    // Store habit offline
    async storeHabitOffline(habit: any) {
        if (!this.db) await this.initDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['habits'], 'readwrite');
            const store = transaction.objectStore('habits');

            const habitData = {
                ...habit,
                id: habit.id || `offline_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                offline: true
            };

            const request = store.add(habitData);

            request.onsuccess = () => {
                console.log('✅ Offline Storage: Habit stored offline');
                resolve();
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to store habit');
                reject(request.error);
            };
        });
    }

    // Get offline habits
    async getOfflineHabits(userId: string) {
        if (!this.db) await this.initDatabase();

        return new Promise<any[]>((resolve, reject) => {
            const transaction = this.db!.transaction(['habits'], 'readonly');
            const store = transaction.objectStore('habits');
            const index = store.index('userId');

            const request = index.getAll(userId);

            request.onsuccess = () => {
                const habits = request.result.filter(habit => habit.offline);
                resolve(habits);
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to get offline habits');
                reject(request.error);
            };
        });
    }

    // Remove offline habit after sync
    async removeOfflineHabit(habitId: string) {
        if (!this.db) await this.initDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['habits'], 'readwrite');
            const store = transaction.objectStore('habits');

            const request = store.delete(habitId);

            request.onsuccess = () => {
                console.log('✅ Offline Storage: Offline habit removed');
                resolve();
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to remove offline habit');
                reject(request.error);
            };
        });
    }

    // Store routine log offline
    async storeRoutineOffline(routine: any) {
        if (!this.db) await this.initDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['routineLogs'], 'readwrite');
            const store = transaction.objectStore('routineLogs');

            const routineData = {
                ...routine,
                id: routine.id || `offline_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                offline: true
            };

            const request = store.add(routineData);

            request.onsuccess = () => {
                console.log('✅ Offline Storage: Routine stored offline');
                resolve();
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to store routine');
                reject(request.error);
            };
        });
    }

    // Get offline routine logs
    async getOfflineRoutines(userId: string) {
        if (!this.db) await this.initDatabase();

        return new Promise<any[]>((resolve, reject) => {
            const transaction = this.db!.transaction(['routineLogs'], 'readonly');
            const store = transaction.objectStore('routineLogs');
            const index = store.index('userId');

            const request = index.getAll(userId);

            request.onsuccess = () => {
                const routines = request.result.filter(routine => routine.offline);
                resolve(routines);
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to get offline routines');
                reject(request.error);
            };
        });
    }

    // Remove offline routine after sync
    async removeOfflineRoutine(routineId: string) {
        if (!this.db) await this.initDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['routineLogs'], 'readwrite');
            const store = transaction.objectStore('routineLogs');

            const request = store.delete(routineId);

            request.onsuccess = () => {
                console.log('✅ Offline Storage: Offline routine removed');
                resolve();
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to remove offline routine');
                reject(request.error);
            };
        });
    }

    // Store offline action
    async storeOfflineAction(action: any) {
        if (!this.db) await this.initDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
            const store = transaction.objectStore('offlineActions');

            const actionData = {
                ...action,
                id: action.id || `offline_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString()
            };

            const request = store.add(actionData);

            request.onsuccess = () => {
                console.log('✅ Offline Storage: Action stored offline');
                resolve();
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to store action');
                reject(request.error);
            };
        });
    }

    // Get offline actions
    async getOfflineActions() {
        if (!this.db) await this.initDatabase();

        return new Promise<any[]>((resolve, reject) => {
            const transaction = this.db!.transaction(['offlineActions'], 'readonly');
            const store = transaction.objectStore('offlineActions');

            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('❌ Offline Storage: Failed to get offline actions');
                reject(request.error);
            };
        });
    }

    // Clear all offline data
    async clearOfflineData() {
        if (!this.db) await this.initDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['habits', 'routineLogs', 'offlineActions'], 'readwrite');

            const habitsStore = transaction.objectStore('habits');
            const routineStore = transaction.objectStore('routineLogs');
            const actionsStore = transaction.objectStore('offlineActions');

            const habitsRequest = habitsStore.clear();
            const routineRequest = routineStore.clear();
            const actionsRequest = actionsStore.clear();

            transaction.oncomplete = () => {
                console.log('✅ Offline Storage: All offline data cleared');
                resolve();
            };

            transaction.onerror = () => {
                console.error('❌ Offline Storage: Failed to clear offline data');
                reject(transaction.error);
            };
        });
    }

    // Get storage usage
    async getStorageUsage() {
        if (!this.db) await this.initDatabase();

        return new Promise<{ habits: number; routines: number; actions: number }>((resolve, reject) => {
            const transaction = this.db!.transaction(['habits', 'routineLogs', 'offlineActions'], 'readonly');

            const habitsStore = transaction.objectStore('habits');
            const routineStore = transaction.objectStore('routineLogs');
            const actionsStore = transaction.objectStore('offlineActions');

            const habitsRequest = habitsStore.count();
            const routineRequest = routineStore.count();
            const actionsRequest = actionsStore.count();

            let habitsCount = 0;
            let routinesCount = 0;
            let actionsCount = 0;

            habitsRequest.onsuccess = () => {
                habitsCount = habitsRequest.result;
            };

            routineRequest.onsuccess = () => {
                routinesCount = routineRequest.result;
            };

            actionsRequest.onsuccess = () => {
                actionsCount = actionsRequest.result;
            };

            transaction.oncomplete = () => {
                resolve({
                    habits: habitsCount,
                    routines: routinesCount,
                    actions: actionsCount
                });
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }
}

// Initialize offline storage manager
export const offlineStorage = new OfflineStorageManager();
