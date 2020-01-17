
export interface Monad<T>{
    flatmap<F>(func:(v:T)=>Monad<F>):Monad<F>
}

//f1: b -> Mc , f2: a -> Mb  compose(f2,f1): a -> Mc
export function m_compose<A,B,C>(f1:(b:B)=>Monad<C>,f2:(a:A)=>Monad<B>){
    return (a:A)=>f2(a).flatmap(x=>f1(x))
}

export function m_compose3<A,B,C,D>(f1:(c:C)=>Monad<D>,f2:(b:B)=>Monad<C>,f3:(a:A)=>Monad<B>){
    return (a:A)=>f3(a).flatmap(b=>f2(b).flatmap(c=>f1(c)))
}

export const promiseOf = <T>(v:T|undefined|null)=>{
    if(v) return Promise.resolve(v)
    else return Promise.reject("null/undefined value accepted")

}