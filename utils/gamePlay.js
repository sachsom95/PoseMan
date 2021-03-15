//Gameplay
import {Machine, interpret,assign} from "xstate";
import {stateMachine} from '../stateMachine.js';
export let testString = "YMCA";
export let userAnswer = "";
export let service;

export function gameOn() {
  service = interpret(stateMachine).start();  
  service.onTransition(current => {
    console.log(current);
  });
  document.getElementById('startButton').addEventListener('click', function () {
      // function handleSubmit () {
        console.log(stateMachine.states);
        console.log("Submitting");
        service.send("SUBMIT");
      // }
    }); 
}

export function startCountdown() {
  var timeleft = 10;
  var downloadTimer = setInterval(function(){
    if(timeleft <= 0){
      clearInterval(downloadTimer);
    }
    document.getElementById("progressBar").value = 10 - timeleft;
    timeleft -= 1;
  }, 1000);
}
