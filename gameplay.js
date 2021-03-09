export default function gamePlay(answer, userAnswer) {
    return new Promise((resolve, reject) => {
      console.log("playing...");

      setTimeout(() => { //Timed play!
        //If we win before:
        if (answer === userAnswer) return resolve("You won!");
  
        //Otherwise:
        return reject("You lost!");
      }, 5000); //5 seconds
    });
  }