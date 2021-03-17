import {loadModel} from '../camera.js';
// import {Machine, interpret, assign} from "xstate";
// import {stateMachine} from '../stateMachine.js';

// contains all used images
export var lst = [];
// stores levelJson data
export var levelData;

// export let service;
export let answer;
export let userAnswer;
var counter = 0;
export let loaded = false;

function compareStrings(letter, id){
  console.log('Comparing');
  if(answer.charAt(id) == letter) {
    document.getElementById("text_box"+id).style.backgroundColor = "green";
    ++counter;
  } else {
    document.getElementById("text_box"+id).style.backgroundColor = "red";
  }

  if(counter == 3) {
    clearLetters();
    nextImage();
  }
}

export function insertInputText(label) {
  console.log("text_box"+counter);
  console.log(label);
  document.getElementById("text_box"+counter).value = label;
  // compareStrings(document.getElementById("text_box"+counter).value, counter); //Comment this to input text by hand and not through model
}

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

export function nextImage(){
    console.log("came to next image function");
    counter = 0;
    var index = getImage();
    imageVisitied(index);
    var image = levelData[index];
    var url = './images/' + image;
    //Grabs name of file as answer:    
    console.log(image.slice(0,image.indexOf(".")));
    answer = image.slice(0,image.indexOf(".")).toUpperCase();
    
    // service = interpret(stateMachine).start();
    // service.send("INPUT_CHANGE", {
    //   name: "answer",
    //   value: image.slice(0,image.indexOf("."))      
    // });

    // service = interpret(stateMachine).onTransition(current => {
    //   state=current
    //   console.log(current);
    // });    
    console.log(url);
    document.getElementById("guess_image").src = url;
    makeLetters(3);
    loaded = true;
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



// This two function will generate the text boxes put number in to @data to make that many 
// text boxes 
// Onchange = Updates the new letter from the input
const helperMakeLetter = function(id,placeholder){
  var element = document.createElement("input");
  element.className= "form-control";
  element.placeholder = placeholder;
  element.id = "text_box"+id;  //id in letter in put
  element.onchange = function () {    
    console.log("New Letter");
    compareStrings(element.value,id); //Text input by hand change if not commented

    // service = interpret(stateMachine).start();
    // service.send("INPUT_CHANGE", {
    //   value: element.target.value,
    //   name: element.target.name
    // });
  }
  return element;
}

export const clearLetters = function(){  
    var list = document.getElementById("word_list");
    while (list.firstChild) {
      list.removeChild(list.lastChild);
    }
}

export const makeLetters = function(data){
    var domElement="";
    for(var i = 0; i < data; i++){
        domElement = helperMakeLetter(i,"_");  
        document.getElementById("word_list").appendChild(domElement);
    }
}

export const readSetGo = function(){
  document.getElementById("start_btn").style.display = "none";

  var ml4 = {};
  ml4.opacityIn = [0,1];
  ml4.scaleIn = [0.2, 1];
  ml4.scaleOut = 3;
  ml4.durationIn = 800;
  ml4.durationOut = 600;
  ml4.delay = 500;
  
  anime.timeline({loop: false})
    .add({
      targets: '.ml4 .letters-1',
      opacity: ml4.opacityIn,
      scale: ml4.scaleIn,
      duration: ml4.durationIn
    }).add({
      targets: '.ml4 .letters-1',
      opacity: 0,
      scale: ml4.scaleOut,
      duration: ml4.durationOut,
      easing: "easeInExpo",
      delay: ml4.delay
    }).add({
      targets: '.ml4 .letters-2',
      opacity: ml4.opacityIn,
      scale: ml4.scaleIn,
      duration: ml4.durationIn
    }).add({
      targets: '.ml4 .letters-2',
      opacity: 0,
      scale: ml4.scaleOut,
      duration: ml4.durationOut,
      easing: "easeInExpo",
      delay: ml4.delay
    }).add({
      targets: '.ml4 .letters-3',
      opacity: ml4.opacityIn,
      scale: ml4.scaleIn,
      duration: ml4.durationIn
    }).add({
      targets: '.ml4 .letters-3',
      opacity: 0,
      scale: ml4.scaleOut,
      duration: ml4.durationOut,
      easing: "easeInExpo",
      delay: ml4.delay
    }).add({
      targets: '.ml4',
      opacity: 0,
      duration: 500,
      delay: 500
    });
        document.getElementById("right_game_window_h1").innerHTML = "Guess The Word!";
        document.getElementById("right_game_window_p").innerHTML ="Make letters with your arms and legs and guess the word";
    setTimeout(()=>{
        
        nextImage();
        document.getElementById("guess_image").style.visibility = "visible";
        document.getElementById("word1").style.visibility = "visible";
        console.log("starting game");
        // loadModel();

    },6000 );    
}