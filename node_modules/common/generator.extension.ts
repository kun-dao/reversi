export { }

const Generator = Object.getPrototypeOf(function* () { });

declare global {
    interface Generator<T> {
        map<F>(mapper: (t: T) => F): Generator<F>;
        filter(pred : (t:T)=>boolean) : Generator<T>;
        collectFor(forPred:(v:T,i:number) => boolean):T[];
        collect():T[];
        first() : T | null;
        take(n:number):T[];
        pick(pickPred:(v:T,i:number) => boolean) : T | null;
        pickRelative(pickPred:(v1:T,v2:T)=>boolean) : T
    }
}      
Generator.prototype.map = function* <T,F>(mapper:(v:T)=>F) {
    for (const val of this) {
        yield mapper(val)
    }
};

Generator.prototype.filter = function* <T>(pred:(v:T)=>boolean){
    for (const val of this) {
       if(pred(val)) yield val
    }
}

Generator.prototype.collect = function<T>():T[]{
    var result :T[] = []
    for (const val of this) {
        result.push(val)
    }
    return result;
}

Generator.prototype.collectFor = function <T>(forPred:(v:T,i:number) => boolean):T[]{
    var result :T[] = []
    var index = 0;
    for (const val of this) {
        if(!forPred(val,index++)) break;
        result.push(val)
    }
    return result;
}

Generator.prototype.take = function <T>(n:number):T[]{
    var result :T[] = []
    var index = 0;
    for (const val of this) {
        if(index++>=n) break;
        result.push(val)
    }
    return result;
}


Generator.prototype.pick = function <T>(pickPred:(v:T,i:number) => boolean):T|null{
    var index = 0;
    for (const val of this) {
        if(pickPred(val,index++)) 
            return val;
    }
    return null;
}

Generator.prototype.first = function <T>():T|null{
    for (const val of this) {
        return val;
    }
    return null;
}

Generator.prototype.pickRelative = function<T>(pickPred:(v1:T,v2:T)=>boolean) : T {
    let [x,y] = [this.next().value,this.next().value]
    while(true){
        if(pickPred(x,y)) return y;
        else [x,y] = [y,this.next().value]
    }     
}

export const sequenceOf = <T>(f:(x:T)=>T, init:T) => {
    return (function*(){
        let cur = init
        while(true){
            yield cur
            cur = f(cur)
        }
    })()
}


export function* foreverFrom(start:number){
    var cur = start;
    while(true){
        yield cur++
    }
}

export function* forever(){
    var cur = 0;
    while(true){
        yield cur++
    }
}


export function* pairs(x:[number,number],y:(x:number)=>[number,number]){
    for(let a = x[0]; a<=x[1];a++){
        let yrange = y(a)
        for(let b = yrange[0]; b<=yrange[1] ;b++)
            yield {x:a,y:b}
    }
}