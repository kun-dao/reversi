import {performance} from "perf_hooks"
 
export { }

declare global {
    interface Object{
        trace(label:string):Object
    }
}

Object.prototype.trace = function(label:string){
    console.log(label + ":" +JSON.stringify(this));
    return this;
}

export const trace = <T>(v:T)=>{
    console.log(v);
    return v;
    
}

export const trace_l = <T>(label:string,v:T)=>{
    console.log(`${label}:${JSON.stringify(v)}`);
    return v;
}

export const trace_t = <T>(label:string,f:()=>T)=>{
    const start = performance.now()
    const result = f();
    const timespan = performance.now()-start
    console.log(`${label}:${JSON.stringify(result)} within ${timespan}ms`);
    return result;
}