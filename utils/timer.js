import {TimeCounter, Timer} from "easytimer.js"

var timer = new Timer();
const easy = 10;
const medium = 20;
const hard = 15;
var timer_div = document.getElementById("timer");



export const countDown = function(){
    timer.start({countdown:true,precision:'secondTenths',startValues:{seconds:easy}});
    timer.addEventListener('secondsUpdated',function(e){
        timer_div.innerHTML = timer.getTimeValues().toString(['minutes','seconds']);
        console.log(`time:${timer.getTimeValues().toString()}`)
    });


    timer.addEventListener('targetAchieved',function(e){
        timer_div.innerHTML = "Final Score is : 100";
        // console.log("INVOKE GAMEOVER HERE");
        gameOver();
    })
};



export const gameOver = function(){
    document.getElementById("right_game_window_h1").innerHTML = "Game Over!";
    document.getElementById("right_game_window_p").innerHTML ="Your all streached and ready for next round of coding. Good luck Soldier :)";
    document.getElementById("guess_image").style.display = "None";
    document.getElementById("word_list").style.display = "None"

}