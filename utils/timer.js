import {TimeCounter, Timer} from "easytimer.js"
import {sound} from  '../camera.js';
import {soundBackground} from  './gameUtils.js';
import {firebaseConfig} from './config.js'
import firebase from "firebase/app";
import "firebase/database";

var timer = new Timer();
const easy = 10;
const medium = 20;
const hard = 15;
var timer_div = document.getElementById("timer");

var soundCheers = new sound('./sounds/cheers.mp3');
var soundGameOver = new sound('./sounds/gameOver.mp3');

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
    document.getElementById("start_words").style.visibility = "hidden";
    soundBackground.stop();
    soundCheers.play();
    document.getElementById("right_game_window_h1").innerHTML = "Game Over!";
    document.getElementById("right_game_window_p").innerHTML ="Your all streached and ready for next round of coding. Good luck Soldier :)";
    document.getElementById("guess_image").style.visibility = "hidden";
    document.getElementById("word_list").style.visibility = "hidden"
    document.getElementById("replay_btn").style.visibility = "visible";
    
    //Save Score to Firebase - Need to change
    saveScore("Net", 10);
}

function saveScore(userName, scoreDone) {
    // Initialize Firebase
    var x =  Math.floor(Math.random()*100);
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
    firebase.database().ref('users/' + 'user'+x).set({
        name: userName,
        score: scoreDone
      });
}