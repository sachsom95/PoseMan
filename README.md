![image](https://user-images.githubusercontent.com/55349036/111832782-1ec64580-88e9-11eb-986b-ef58f0bd9902.png)


# PoseMan

PoseMan is a Web-game to gameify 5 min breaks after an hour long coding session. Standup and make poses to guess the word. Don't worry privacy. The Webcam converts you body into an animated SVG letting you do all the poses you want.

<blockquote> <b> The game requires full view of body not just the hands </b> </blockquote>

<p align="center">
<img width="400" alt="Screenshot 2021-02-26 at 01 56 26" src="https://user-images.githubusercontent.com/55349036/111836799-c72ad880-88ee-11eb-83ca-a5459a354b93.gif"></p>


## How to Play
- Access the WebPage from [here](https://poseman.netlify.app)
- Provide access to camera
- See your animated SVG on left (random Avatar on each page load)
- Start the game by pressing the start Button
- Stand back the Model works only if the full torso is visible 
- Start guessing and good luck :)


## Features
- Inspired by the [Tensorflow research blog](https://blog.tensorflow.org/2020/05/pose-animator-open-source-tool-to-bring-svg-characters-to-life.html) the app captures webcam feed and passes the data to an ML model to animate the SVG.
- A seprate Neural network trained on Poses will try to capture user poses and give outputs.
- Light weight JS Web application runs right on your browser 


## Requirements

[yarn](https://classic.yarnpkg.com/en/docs/install) \
Yarn should be installed on your machine to run the game

## Game Settings

No additional settings are required for this extension.

## Expanding the game in dev mode

- Clone the repository
- Run the following commands on the terminal
```
yarn
yarn watch
```

## Release Notes
### 1.0.0
Initial release of PoseMan

### For more information

* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
