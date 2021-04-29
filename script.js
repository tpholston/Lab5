// script.js
const img = new Image(); // used to load image from <input> and draw to canvas

const canvas = document.getElementById("user-image");
const ctx = canvas.getContext("2d");

const generateButton = document.getElementsByTagName("button")[0];
const resetButton = document.getElementsByTagName("button")[1];
const readButton = document.getElementsByTagName("button")[2];
const imageInput = document.getElementById("image-input");
const voiceSelector = document.getElementById("voice-selection");

const generateMeme = document.getElementById("generate-meme");
const setVolumn = document.getElementById("volume-group");

let currentVoice;
let voices;
let volumn = 1;

voiceSelector.disabled = false;
let utterance = window.speechSynthesis;

generateMeme.addEventListener('submit', (event) => 
{
  //grab text input
  let topText = document.getElementById('text-top').value;
  let bottomText = document.getElementById("text-bottom").value;

  //toggle buttons
  resetButton.disabled = false;
  readButton.disabled = false;

  //write text
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.textAlign = "center";
  ctx.strokeText(topText, canvas.width / 2, 25);
  ctx.fillText(topText, canvas.width / 2, 25);
  ctx.strokeText(bottomText, canvas.width / 2, canvas.width - 25);
  ctx.fillText(bottomText, canvas.width / 2, canvas.width - 25);
  event.preventDefault();
});

setVolumn.addEventListener('input', () => {
  let currVolumn = document.querySelector("input[type=range]").value;
  const imagePic = document.querySelector("img[alt='Volume Level 3']");
  if(currVolumn >= 67) {
    imagePic.src = "icons/volume-level-3.svg";
  } else if(currVolumn >= 34 && currVolumn < 67) {
    imagePic.src = "icons/volume-level-2.svg";
  } else if(currVolumn >= 1 && currVolumn < 34) {
    imagePic.src = "icons/volume-level-1.svg";
  } else {
    imagePic.src = "icons/volume-level-0.svg";
  }
  volumn = currVolumn / 100;
});

readButton.addEventListener('click', () => {
  let topText = document.getElementById('text-top').value;
  let bottomText = document.getElementById("text-bottom").value;
  utterance = new SpeechSynthesisUtterance(topText + bottomText);
  utterance.volume = volumn;
  utterance.voice = currentVoice;
  speechSynthesis.speak(utterance);
});

const populateVoices = () => {
  const availableVoices = speechSynthesis.getVoices();
  voiceSelector.innerHTML = '';

  availableVoices.forEach(voice => {
    const option = document.createElement('option');
    let optionText = `${voice.name} (${voice.lang})`;
    if (voice.default) {
      optionText += ' [default]';
      if (typeof currentVoice === 'undefined') {
        currentVoice = voice;
        option.selected = true;
      }
    }
    if (currentVoice === voice) {
      option.selected = true;
    }
    option.textContent = optionText;
    voiceSelector.appendChild(option);
  });
  voices = availableVoices;
};

populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

voiceSelector.addEventListener('change', event => {
  const selectedIndex = event.target.selectedIndex;
  currentVoice = voices[selectedIndex];
});

resetButton.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  generateButton.disabled = false;
  resetButton.disabled = true;
  readButton.disabled = true
});

imageInput.addEventListener('change', () => {
  img.src = URL.createObjectURL(imageInput.files[0]);
  img.alt = img.src.replace(/^.*?([^\\\/]*)$/, '$1');
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  // Some helpful tips:
  ctx.clearRect(0,0,canvas.width,canvas.height);

  document.getElementById('text-top').value="";
  document.getElementById("text-bottom").value="";

  generateButton.disabled = false;
  resetButton.disabled = true;
  readButton.disabled = true;

  ctx.fillstyle = "black";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  let imageDimensions = getDimmensions(400,400,img.width,img.height);
  ctx.drawImage(img, imageDimensions.startX, imageDimensions.startY, imageDimensions.width, imageDimensions.height);

  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
