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
let clipPath, filterTarget;
    
// const can = new fabric.Canvas("c", 
//     {
//         width: (window.innerWidth - 10),
//         height: (window.innerHeight - 17),
//         preserveDrawingBuffer: true
//     });
// can.backgroundColor = '#ffffff';


fabric.enableGLFiltering = false;
fabric.Canvas2dFilterBackend && (fabric.filterBackend = new fabric.Canvas2dFilterBackend());

image.src = "test.jpg";
image.onload = function() { // upon image loading, the canvas sets up dimensions to image dimesions
    preload.width = image.naturalWidth; // then will draw the image via the context
    preload.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    preload.style.display = "none";

    fabricImg = new fabric.Image(image, {
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1
    });
    canvas.set("backgroundImage", fabricImg);
    
    blurredImg = new fabric.Image(image, {
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        lockMovementX: true,
        lockMovementY: true
    });
    blurredImg.hasControls = false;
    blurredImg.hasBorders = false;
    canvas.add(blurredImg);
    blurring(blurredImg);
    blurredImg.clipPath = clipPath;
    canvas.sendObjectToBack(blurredImg);

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
// can.clipPath = clipPath;
// can.requestRenderAll();
filterTarget.on('moving', function() {
    console.log("filter moving");
    clipPath.top = filterTarget.top;
    clipPath.left = filterTarget.left;
    clipPath.setCoords();
    blurredImg.dirty = true;
    canvas.requestRenderAll();
});

function chromaAbberation(imgData, intensity, phase) {
    let data = imgData.data;
    for(let i = phase % 4; i < data.length; i+=4) {
        data[i] = data[i + 4 * intensity]; // follows the matrix math-- aka, everything gets shifted over
    }
    ctx.putImageData(imageData, 0, 0)
}

function blurring(img) {
    const filter = new fabric.filters.Blur({
        blur: 0.7
    });

    img.filters.push(filter);
    img.applyFilters();
    canvas.renderAll();
}