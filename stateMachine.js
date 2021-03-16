import {Machine, assign} from "xstate";
import gamePlay from "./play.js";

const stateMachine = Machine({
  initial: "waiting",
  context: { //How we save the letters accepted
    answer:"",
    userAnswer: ""
  },
  states: {
    waiting: {
      on: {
        SUBMIT: "start"
      }
    },
    start: {
      invoke: {
        id: "play",
        src: (context, event) => {
          const {answer,userAnswer} = context;
          gamePlay(answer, userAnswer);
        },
        onDone: {
          target: "endGame"
        },
        onError: { //Not sure 
          target: "endGame"
        }
      }
    },    
    endGame: {
      type: "final"
    }
  },
  on: {
    INPUT_CHANGE: { //Event that updates the context aka answer and user answer
      actions: assign((context, event) => {
        console.log(event);
        return {          
          [event.name]: event.value,
        };
      })
    }
  }
});

export {stateMachine};