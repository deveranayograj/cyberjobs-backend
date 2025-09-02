// central deep serialize util (converts BigInt -> string)
export function deepSerialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map((item) => deepSerialize(item));
    if (typeof obj === 'object') {
        const res: any = {};
        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
            res[key] = deepSerialize(obj[key]);
        }
        return res;
    }
    return obj;
}
