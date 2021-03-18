import {Timer} from "easytimer.js"

export const countDown = function(time){
    var timer = new Timer();
    timer.start({countdown:true,precision:'secondTenths',startValues:{seconds:time}});
    timer.addEventListener('secondTenthsUpdated', function (e) {
    document.getElementById("timer").innerHTML = timer.getTimeValues().toString(['seconds','secondTenths']);
    });
}
