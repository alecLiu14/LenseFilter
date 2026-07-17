// import * as fabric from 'fabric';

// variables for image and filter set up
const preload = document.getElementById("preload");
const ctx = preload.getContext("2d");
const image = new Image(); // for filters that can just use the raw image
const tempImage = new Image(); // for filters that need a transparent buffer
const canvas = new fabric.Canvas("actual", 
    {
        width: (window.innerWidth - 10),
        height: (window.innerHeight - 17),
        preserveDrawingBuffer: true
    });
let fabricImg = "";
let clipPath, filterTarget, activeFilter = false;
let strokeWidth = 80;

// drop down menu variables
const filterMenu = document.getElementById("filter-select");
const filterMap = new Map();

// fabric canvas setup + HTML element setup
fabric.enableGLFiltering = false;
fabric.Canvas2dFilterBackend && (fabric.filterBackend = new fabric.Canvas2dFilterBackend());
preload.style.display = "none";
filterMenu.style.visibility = "hidden";

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

    filterMenu.style.visibility = "visible";
}

filterMenu.addEventListener("input", (element) => {
    let filterString = element.target.value;
    if (typeof window[filterString] === "function") {
        if(activeFilter) {
            activeFilter.visible = false;
            if(filterMap.get(filterString)) {
                activeFilter = filterMap.get(filterString);
                activeFilter.visible = true;
                return;
            }
        }
        window[filterString](); // calls on the filter
        return;
    }
        
});

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

function chromaAbb() {
    /* steps for non vanilla canvas image modifications:
        0. image data will have already been saved to imgData on image load
        1. clear the hidden canvas
        2. pull the data down and modify it
            a. issue: how to keep an untouched variant of this?
        3. put image data and then take the URL of it to use as a source to create a new fabricImage layer
    */
    let intensity = 15, phase = 1;
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
    clipPathSetup(chromaImg)

    canvas.requestRenderAll();
    ctx.clearRect(0, 0, preload.width, preload.height);
    activeFilter = chromaImg;
}

function blur() {
    console.log("blurring");
    let blurImg = new fabric.Image(tempImage, {
        lockMovementX: true,
        lockMovementY: true,
    });
    imageSettingApply(blurImg, true);
    
    const filter = new fabric.filters.Blur({
        blur: .5
    });

    blurImg.filters.push(filter);
    blurImg.applyFilters();
    canvas.renderAll();

    clipPathSetup(blurImg);
    
    activeFilter = blurImg;
    filterMap.set("blur", blurImg);

    canvas.requestRenderAll();
}

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