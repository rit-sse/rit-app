// TODO: Rework into memory?

// Define the structure of a restaurant type
interface RestaurantType {
    id: number,
    name: string,
    type: string,
    open: boolean,
    code: string,
    link: string,
    image: string,
    busyLevel: number | null,
    hoursOfOperations?: {[day: string]: string} | null
}

class CacheSingleton {
    private static cacheinstance: CacheSingleton;
    private static webCache: {[keyName: string]: string} = {};
    
    constructor() {
        if(!CacheSingleton.cacheinstance) {
            CacheSingleton.cacheinstance = new CacheSingleton();
        } else {
            return CacheSingleton.cacheinstance;
        }
    }

    inCache(code: string): boolean {
        return Object.keys(CacheSingleton.webCache).includes(code);
    }

    getCache(code: string): string {
        return CacheSingleton.webCache[code];
    }
}