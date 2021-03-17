import * as posenet_module from '@tensorflow-models/posenet';
import * as facemesh_module from '@tensorflow-models/facemesh';
import * as tf from '@tensorflow/tfjs';
import * as paper from 'paper';

import {drawKeypoints, drawPoint, drawSkeleton, isMobile, toggleLoadingUI, setStatusText} from './utils/demoUtils';
import {SVGUtils} from './utils/svgUtils'
import {PoseIllustration} from './illustrationGen/illustration';
import {Skeleton, facePartName2Index} from './illustrationGen/skeleton';
import {FileUtils} from './utils/fileUtils';

import * as girlSVG from './resources/illustration/girl.svg';
import * as boySVG from './resources/illustration/boy.svg';
import { ComposableTask, loadMtcnnModel } from 'face-api.js';

// import {Machine, interpret,assign} from "xstate";
// import {stateMachine} from './stateMachine.js';

import {getImage,lst,levelData,imageVisitied,passJson,readJson,nextImage,readSetGo,insertInputText,loaded} from './utils/gameUtils.js'
import {gameOn,startCountdown,testString,userAnswer,service} from './utils/gamePlay.js'
import {allSet,readyState} from './utils/readyState.js'
// levels info
const levelInfo = {
  easy: 'levels/easy.json',
  medium: 'levels/medium.json',
  difficult: 'levels/hard.json'
};
//This function will collect the Json file for particular level
//Since we need to use xmlhttp I had to make it async
async function getOutput(){
  await readJson(levelInfo.easy);
  console.log(`data for level collected`)
}



// Camera stream video element
let video;
let videoWidth = 640;
let videoHeight = 480;

// Canvas
let faceDetection = null;
let illustration = null;
let canvasScope;
let canvasWidth = 800;
let canvasHeight = 800;

// ML models
let facemesh;
let posenet;
let minPoseConfidence = 0.15;
let minPartConfidence = 0.1;
let nmsRadius = 30.0;

// Misc
let mobile = false;
const avatarSvgs = {
  'girl': girlSVG.default,
  'boy': boySVG.default,
};

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: videoWidth,
      height: videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

const defaultPoseNetArchitecture = 'MobileNetV1';
const defaultQuantBytes = 2;
const defaultMultiplier = 1.0;
const defaultStride = 16;
const defaultInputResolution = 200;

const guiState = {
  avatarSVG: Object.keys(avatarSvgs)[0],
  debug: {
    showDetectionDebug: false,
    showIllustrationDebug: false,
  },
};


//Model variables
let poseNet;
let pose;
let brain;
let skeleton;
let poseLabel = "Nothing yet!";

//This function sends the letter to the input letter hold
function draw() {  
  document.getElementById('image-label').innerHTML = poseLabel;
}

function setupModel() {
  console.log('Setting up!');
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

export function loadModel() {
  let options = {
    inputs: 34,
    outputs: 7,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin'
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  // console.log('Classify pose');
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) { 
  if (results[0].confidence > 0.80) {
    poseLabel = results[0].label.toUpperCase();
    // console.log(poseLabel);
    draw();
    if(Boolean(loaded)) {
      insertInputText(poseLabel);
    }    
  } 
  classifyPose();
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
  var splash = document.getElementById("loader");
  splash.classList.add('display-none');
}


//SVG animation
/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video) {
  const canvas = document.getElementById('output');
  const keypointCanvas = document.getElementById('keypoints');
  const videoCtx = canvas.getContext('2d');
  const keypointCtx = keypointCanvas.getContext('2d');

  canvas.width = videoWidth;
  canvas.height = videoHeight;
  keypointCanvas.width = videoWidth;
  keypointCanvas.height = videoHeight;

  async function poseDetectionFrame() {


    let poses = [];
   
    videoCtx.clearRect(0, 0, videoWidth, videoHeight);
    // Draw video
    videoCtx.save();
    videoCtx.scale(-1, 1);
    videoCtx.translate(-videoWidth, 0);
    // videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight); //this comment disables self-video
    videoCtx.restore();

    // Creates a tensor from an image
    //keeping it in multi-person makes the svg detection better - sachin
    const input = tf.browser.fromPixels(canvas);
    faceDetection = await facemesh.estimateFaces(input, false, false);
    let all_poses = await posenet.estimatePoses(video, {
      flipHorizontal: true,
      decodingMethod: 'multi-person',
      maxDetections: 1,
      scoreThreshold: minPartConfidence,
      nmsRadius: nmsRadius
    });

    poses = poses.concat(all_poses);
    input.dispose();

    keypointCtx.clearRect(0, 0, videoWidth, videoHeight);
    if (guiState.debug.showDetectionDebug) {
      poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
          drawKeypoints(keypoints, minPartConfidence, keypointCtx);
          drawSkeleton(keypoints, minPartConfidence, keypointCtx);
        }
      });
      faceDetection.forEach(face => {
        Object.values(facePartName2Index).forEach(index => {
            let p = face.scaledMesh[index];
            drawPoint(keypointCtx, p[1], p[0], 2, 'red');
        });
      });
    }

    canvasScope.project.clear();

    if (poses.length >= 1 && illustration) {
      Skeleton.flipPose(poses[0]);

      if (faceDetection && faceDetection.length > 0) {
        let face = Skeleton.toFaceFrame(faceDetection[0]);
        illustration.updateSkeleton(poses[0], face);
      } else {
        illustration.updateSkeleton(poses[0], null);
      }
      illustration.draw(canvasScope, videoWidth, videoHeight);

      if (guiState.debug.showIllustrationDebug) {
        illustration.debugDraw(canvasScope);
      }
    }

    canvasScope.project.activeLayer.scale(
      canvasWidth / videoWidth, 
      canvasHeight / videoHeight, 
      new canvasScope.Point(0, 0));



    requestAnimationFrame(poseDetectionFrame);
  }
  poseDetectionFrame();
}

function setupCanvas() {
  mobile = isMobile();
  if (mobile) {
    canvasWidth = Math.min(window.innerWidth, window.innerHeight);
    canvasHeight = canvasWidth;
    videoWidth *= 0.7;
    videoHeight *= 0.7;
  }  

  canvasScope = paper.default;
  let canvas = document.querySelector('.illustration-canvas');;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvasScope.setup(canvas);
}

/**
 * Kicks off the game by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {
  setupCanvas();

  // toggleLoadingUI(true);
  setStatusText('Loading the models...');
  // attach evenListner to our start button start_btn
  var p = document.getElementById("start_btn"); // Find the paragraph element in the page
  p.onclick = readSetGo;
    posenet = await posenet_module.load({
    architecture: defaultPoseNetArchitecture,
    outputStride: defaultStride,
    inputResolution: defaultInputResolution,
    multiplier: defaultMultiplier,
    quantBytes: defaultQuantBytes
  });
  setStatusText('Loading FaceMesh model...');
  facemesh = await facemesh_module.load();

  setStatusText('Loading Avatar file...');
  let t0 = new Date();
  await parseSVG(Object.values(avatarSvgs)[0]);
  setStatusText('Setting up camera...');
  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this device type is not supported yet, ' +
      'or this browser does not support video capture: ' + e.toString();
    info.style.display = 'block';
    throw e;
  }
  
  // toggleLoadingUI(false);
  setupModel();
  // allSet().then(gameOn);
  detectPoseInRealTime(video, posenet);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
FileUtils.setDragDropHandler((result) => {parseSVG(result)});

async function parseSVG(target) {
  // let svgScope = await SVGUtils.importSVG(target /* SVG string or file path */);
  var avatar_select="";
  (Math.floor(Math.random()*2) === 0) ? avatar_select="boy" : avatar_select="girl";
  let svgScope = await SVGUtils.importSVG((avatarSvgs)[avatar_select]); //forces just girl avatar
  let skeleton = new Skeleton(svgScope);
  illustration = new PoseIllustration(canvasScope);
  illustration.bindSkeleton(skeleton, svgScope);
}

loadModel();
bindPage();
// startCountdown();
// gameOn();
getOutput();
// setTimeout(() =>{
  
//   readSetGo()
// },20000 )
