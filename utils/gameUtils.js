// getRandom image without repetition
export var lst = [];
export const getImage = function() {
    do{
        var x =  Math.floor(Math.random()*11);
    }
    while(lst.indexOf(String(x)) != -1);
    return x;
}

export const imageVisitied = function (data){
    lst.push(String(data));
}