// getRandom image without repetition
export var lst = [];
export var levelData;
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


function passJson(data){
    levelData = data;

}


export const readJson =  function(url){
    return new Promise((resolve,reject)=>{
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            passJson(myArr);
            resolve();
            }
        };
    })
    
}
