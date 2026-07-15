// import * as fabric from 'fabric';

// variables for image and filter stuff
const preload = document.getElementById("preload");
const ctx = preload.getContext("2d");
const image = new Image();
const tempImage = new Image();
const canvas = new fabric.Canvas("actual", 
    {
        width: (window.innerWidth - 10),
        height: (window.innerHeight - 17),
        preserveDrawingBuffer: true
    });
let fabricImg = "";
let blurredImg = "";
let clipPath, filterTarget, activeTarget;
let strokeWidth = 80;

//

fabric.enableGLFiltering = false;
fabric.Canvas2dFilterBackend && (fabric.filterBackend = new fabric.Canvas2dFilterBackend());
preload.style.display = "none";

image.src = "test.jpg";
image.onload = function() { // upon image loading, the canvas sets up dimensions to image dimesions
    preload.width = image.width + (strokeWidth * 2);
    preload.height = image.height + (strokeWidth * 2);
    ctx.drawImage(image, strokeWidth, strokeWidth, image.width, image.height);
    tempImage.src = preload.toDataURL();
    
    // fabricImg = new fabric.Image(tempImage);
    fabricImg = new fabric.Image(image);
    canvas.centerObject(fabricImg);
    fabricImg.scaleToHeight(canvas.height / 1.5);
    canvas.set("backgroundImage", fabricImg);
    // chromaLayer(15, 1);
    blurLayer();
    
}

filterTarget = new fabric.Circle({
    radius: 100,
    top: 100,
    left: 100,
    fill: 'transparent',
    // stroke: 'red',
    hasControls: false,
    hasBorders: false
});
canvas.add(filterTarget);

clipPath = new fabric.Circle({
    radius: 100,
    top: filterTarget.top,
    left: filterTarget.left,
    absolutePositioned: true
});

BGclipPath = new fabric.Circle({
    radius: 100,
    fill: 'white',
    top: filterTarget.top,
    left: filterTarget.left,
    absolutePositioned: true,
    hasControls: false,
    hasBorders: false
});
canvas.add(BGclipPath);

filterTarget.on('moving', function() {
    console.log("filter moving");
    clipPath.top = filterTarget.top;
    clipPath.left = filterTarget.left;
    BGclipPath.top = filterTarget.top;
    BGclipPath.left = filterTarget.left;
    clipPath.setCoords();
    BGclipPath.setCoords();
    canvas.requestRenderAll();
});

function chromaLayer(intensity, phase) {
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
    let imageData = ctx.getImageData(0, 0, preload.width, preload.height);
    let data = imageData.data;

    for(let i = phase % 4; i < data.length; i+=4) {
        data[i] = data[i + 4 * intensity]; // follows the matrix math-- aka, everything gets shifted over
    }

    ctx.putImageData(imageData, 0, 0);
    let chromaRawImg = new Image();
    chromaRawImg.src = preload.toDataURL();
    let chromaImg = new fabric.Image(chromaRawImg, {
        lockMovementX: true,
        lockMovementY: true
    });
    imageSettingApply(chromaImg);

    // chromaLayer.clipPath = clipPath;
    // canvas.sendObjectToBack(chromaLayer);
    clipPathSetup(chromaImg)

    canvas.requestRenderAll();
    ctx.clearRect(0, 0, preload.width, preload.height);
    activeTarget = chromaLayer;
}

function blurLayer() {
    blurredImg = new fabric.Image(tempImage, {
        lockMovementX: true,
        lockMovementY: true,
    });
    imageSettingApply(blurredImg, true);
    
    blurring(blurredImg);
    // blurredImg.clipPath = clipPath;
    // canvas.sendObjectToBack(blurredImg);
    // canvas.sendObjectToBack(BGclipPath);
    clipPathSetup(blurredImg);
    
    activeTarget = blurredImg;

    canvas.requestRenderAll();
}

// functions for filter application functions

/**
 * @param {fabric.Image} img
 * @param {boolean} buffer
 */
function imageSettingApply(img, buffer) {
    let tempToImgRatio = image.height / tempImage.height;
    canvas.centerObject(img);
    if (buffer) {
        img.scaleToHeight(canvas.height / 1.5 * (1-tempToImgRatio+1) );
    }
    else {
        img.scaleToHeight(canvas.height / 1.5);
    }
    img.hasControls = false;
    img.hasBorders = false;
    canvas.add(img);
}

/**
 * @param {fabric.Image} img
 */
function clipPathSetup(img) {
    img.clipPath = clipPath;
    canvas.sendObjectToBack(img);
    canvas.sendObjectToBack(BGclipPath);
}

/**
 * @param {fabric.Image} img
 */
function blurring(img) {
    const filter = new fabric.filters.Blur({
        blur: 0.5
    });

    img.filters.push(filter);
    img.applyFilters();
    canvas.renderAll();
}