import {Timer} from "easytimer.js"

export const countDown = function(time){
    var timer = new Timer();
    timer.start({countdown:true,precision:'secondTenths',startValues:{seconds:time}});
    return timer.getTimeValues().toString(['seconds','secondTenths']);
    
}
