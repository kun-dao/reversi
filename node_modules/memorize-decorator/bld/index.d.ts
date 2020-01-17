export interface MemorizeOptions {
    ttl?: number | false | 'async';
}
export declare function memorize<T extends Function>(fn: T, options?: MemorizeOptions): T;
export declare function memorize(options?: MemorizeOptions): MethodDecorator;
export default memorize;
