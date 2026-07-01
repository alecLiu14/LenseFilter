import { Canvas } from "fabric";

// window.addEventListener('DOMContentLoaded', () => {
//   const canvas = new Canvas(HTMLCanvasElement, {
//   backgroundColor: '#b93939'
// });
// })

let clickCounter = 0;
let plantCounter = 0;
let plantMap = { 
    5: "testPlant1.png",
    10: "https://gif.fxtwitter.com/tweet_video/G8yOyOmXsAAGCVh.webp"            
};

function increment() {
    clickCounter+=1;
    document.getElementById("counter").innerHTML = "You have clicked " + clickCounter + " times";
    if (Object.keys(plantMap).includes(""+clickCounter)) {
        create(plantMap[clickCounter]);
    }
}
function create(imageName) {
    plantCounter+=1;
    let image = document.createElement("img");
    image.src = imageName;
    image.title = "plant " + plantCounter;
    document.getElementById("shelf").appendChild(image);
}