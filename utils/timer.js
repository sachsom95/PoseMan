import {Timer} from "easytimer.js"

var timer = new Timer();
const easy = 30;
const medium = 20;
const hard = 15;
var timer_div = document.getElementById("timer");



export const countDown = function(){
    timer.start({countdown:true,precision:'secondTenths',startValues:{seconds:easy}});
    timer.addEventListener('secondsUpdated',function(e){
        timer_div.innerHTML = timer.getTimeValues().toString(['minutes','seconds']);
        console.log(`time:${timer.getTimeValues().toString()}`)
    })
}