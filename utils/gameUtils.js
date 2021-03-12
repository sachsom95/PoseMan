// contains all used images
export var lst = [];
// stores levelJson data
export var levelData;

// getRandom image without repetition
export const getImage = function() {
    do{
        var x =  Math.floor(Math.random()*11);
    }
    while(lst.indexOf(String(x)) != -1);
    return x;
}
// pushes used images to list
export const imageVisitied = function (data){
    lst.push(String(data));
}

// helper inner function
function passJson(data){
    levelData = data;
}

// Promise based Json read had to use async-await for async
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
