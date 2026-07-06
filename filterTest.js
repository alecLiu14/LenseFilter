// import * as fabric from 'fabric';

const preload = document.getElementById("preload");
const ctx = preload.getContext("2d");
const image = new Image();
const canvas = new fabric.Canvas("actual", 
    {
        width: (window.innerWidth - 10),
        height: (window.innerHeight - 17),
        preserveDrawingBuffer: true
    });
let fabricImg = "";
let blurredImg = "";
let clipPath, filterTarget, activeTarget;
    
// const can = new fabric.Canvas("c", 
//     {
//         width: (window.innerWidth - 10),
//         height: (window.innerHeight - 17),
//         preserveDrawingBuffer: true
//     });
// can.backgroundColor = '#ffffff';


fabric.enableGLFiltering = false;
fabric.Canvas2dFilterBackend && (fabric.filterBackend = new fabric.Canvas2dFilterBackend());
preload.style.display = "none";

image.src = "test.jpg";
image.onload = function() { // upon image loading, the canvas sets up dimensions to image dimesions
    fabricImg = new fabric.Image(image, {
        left: window.innerWidth/2,
        top: window.innerWidth/2,
        scaleX: 1,
        scaleY: 1
    });
    canvas.set("backgroundImage", fabricImg);
    // chromaAbberation(5, 1);
    blurredImg = new fabric.Image(image, {
        left: window.innerWidth/2,
        top: window.innerHeight/2,
        scaleX: 1,
        scaleY: 1,
        lockMovementX: true,
        lockMovementY: true,
    });
    blurredImg.hasControls = false;
    blurredImg.hasBorders = false;
    canvas.add(blurredImg);
    blurring(blurredImg);
    blurredImg.clipPath = clipPath;
    canvas.sendObjectToBack(blurredImg);
    activeTarget = blurredImg;

    canvas.requestRenderAll();
}

filterTarget = new fabric.Circle({
    radius: 100,
    top: 100,
    left: 100,
    fill: 'transparent',
    stroke: 'red',
    hasControls: false,
    hasBorders: false
});

canvas.add(filterTarget);
clipPath = new fabric.Circle({
    radius: 100,
    top: filterTarget.top,
    left: filterTarget.left
});

filterTarget.on('moving', function() {
    console.log("filter moving");
    clipPath.top = filterTarget.top;
    clipPath.left = filterTarget.left;
    clipPath.setCoords();
    activeTarget.dirty = true; // somehow make it so that this can be changed at will, 
    canvas.requestRenderAll();
});

function chromaAbberation(intensity, phase) {
    /* steps for non vanilla canvas image modifications:
        0. image data will have already been saved to imgData on image load
        1. clear the hidden canvas
        2. pull the data down and modify it
            a. issue: how to keep an untouched variant of this?
        3. put image data and then take the URL of it to use as a source to create a new fabricImage layer
    */
    preload.width = image.naturalWidth; // then will draw the image via the context
    preload.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for(let i = phase % 4; i < data.length; i+=4) {
        data[i] = data[i + 4 * intensity]; // follows the matrix math-- aka, everything gets shifted over
    }

    ctx.putImageData(imageData, 0, 0);
    let chromaImg = new Image();
    chromaImg.src = preload.toDataURL();
    let chromaLayer = new fabric.Image(chromaImg, {
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        lockMovementX: true,
        lockMovementY: true
    });
    chromaLayer.hasControls = false;
    chromaLayer.hasBorders = false;
    canvas.add(chromaLayer);
    chromaLayer.clipPath = clipPath;
    canvas.sendObjectToBack(chromaLayer);

    canvas.requestRenderAll();
    ctx.clearRect(0, 0, preload.width, preload.height);
    activeTarget = chromaLayer;
}

function blurring(img) {
    const filter = new fabric.filters.Blur({
        blur: 0.7
    });

    img.filters.push(filter);
    img.applyFilters();
    canvas.renderAll();
}