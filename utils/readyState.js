export var readyState = 'NOT_READY' 
export const  allSet = async () =>{
    readyState = "READY";
    return Promise.resolve();
}