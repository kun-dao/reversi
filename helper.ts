import { Monad} from './node_modules/common/monads';
import memorize from 'memorize-decorator';
export default memorize;

export  function compose(...args){
        return args.reduce((prev,current)=>{
            return function(...values){
                return prev(current(...values))
        }
    })
}

export const pipe = function (...funs) {
    return function(x) {
        for (var i = 0; i < funs.length; i++) {
            x = funs[i](x);
        }
        return x;
    }
}   

type Fn<T1, T2, T3> = (n1: T1, n2: T2) => T3;
type CurriedFn<T1, T2, T3> = (n1: T1) => (n2: T2) => T3


export const curry = <T1, T2, T3>(fn: Fn<T1, T2, T3>): 
    CurriedFn<T1, T2, T3> => {
    return (n1: T1) => (n2: T2) => fn(n1, n2)
}

type CurriedFn_2<T1, T2, T3> = (n2: T2) =>(n1: T1) => T3

/**
 * 柯里化函数的第二参数
 */
export const curry_2 = <T1, T2, T3>(fn: Fn<T1, T2, T3>): 
    CurriedFn_2<T1, T2, T3> => {
    return  (n2: T2) =>(n1: T1) => fn(n1, n2)
}

export class Writer<T> implements Monad<T>{
    constructor(readonly log : string,readonly value : T){}

    static of<T>(log:string,value:T){
        return new Writer<T>(log,value);
    }

    flatmap<F>(f:(v:T)=>Writer<F>):Writer<F>{
        const targetResult = f(this.value)
        return Writer.of(
            [this.log,targetResult.log].join(),
            targetResult.value
        )
    }
    map<F>(f:(v:T)=>F):Writer<F>{
        return Writer.of('map',f(this.value))
    }

}

const _zip = <T>(list1:T[], list2:T[]) => {
    let res:T[][]=new Array<Array<T>>();
    let len = list1.length < list2.length?list1.length:list2.length
    let cnt = 0;
    while(cnt < len){
        res[cnt] = []
        res[cnt].push(list1[cnt])
        res[cnt].push(list2[cnt])
        ++cnt;
    }
    return res
}

/**
 * 类似于python的zip函数，使用了memorize函数做cache,该函数常被调用，且参数范围小，重复几率大，
 * 做cache能节省相同参数重复运行时间
 */
export const zip = memorize(_zip); 

export const sequenceOf = <T>(f:(x:T)=>T, init:T,end:T) => {
    let res:T[]=[];
    let cur = init;
    while(cur != end){
        res.push(cur);
        cur = f(cur);
    }
    return res
}

export const add = (x:number,y:number) => x + y;
const _range=(a:number, b:number) =>a<b?sequenceOf(curry(add)(1),a,b):sequenceOf(curry(add)(-1),a,b)

/**
 * 类似于python range函数，返回[a,b)之间的数组，使用了curry函数转换为一元函数，
 * 使得代码本身具有很好的可读性，使用了memorize函数做cache,该函数常被调用，且参数范围小，重复几率大，做cache能节省相同参数重复运行时间
  */
export const range =memorize(_range) 

export class Maybe<T>{
    constructor(private readonly value: T | null) { }
    map<F>(f: (v: T) => F): Maybe<F> {
        return this.value ? Maybe.of(f(this.value)) : Maybe.none();
    }
    flatmap<F>(f: (v: T) => Maybe<F>): Maybe<F> {
        return this.value ? f(this.value) : Maybe.none();
    }
    static some<T>(value: T) {
        if (!value) {
            throw Error("Provided value must not be empty");
        }
        return new Maybe(value);
    }
    static none<T>(): Maybe<T> {
        return new Maybe<T>(null)
    }
    static of<T>(value: T | undefined): Maybe<T> {
        return !value ? Maybe.none<T>() : Maybe.some(value);
    }
    orElse(defaultValue: T): T {
        return (!this.value) ? defaultValue : this.value
    }

    ifPresent(f:(x:T)=>void){
        if(this.value) f(this.value)
    }

    filter(pred:(x:T)=>boolean):Maybe<T>{
        if(!this.value || !pred(this.value)) return Maybe.none()
        else return this
    }
}
