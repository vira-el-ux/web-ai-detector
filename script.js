// =====================================
// ELEMENT
// =====================================

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");

const statusText =
document.getElementById("status");

const outputText =
document.getElementById("outputText");

const ctx =
canvas.getContext("2d");

// =====================================
// VARIABLE
// =====================================

let lastEmotion = "";

// =====================================
// MODEL URL
// =====================================

const MODEL_URL =
"https://raw.githubusercontent.com/vladmandic/face-api/master/model/";

// =====================================
// LOAD MODEL
// =====================================

async function loadModels(){

    statusText.innerText =
    "Loading AI Models...";

    try{

        // LOAD SEMUA MODEL
        await Promise.all([

            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),

            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)

        ]);

        console.log("MODEL LOADED");

        statusText.innerText =
        "AI Ready ✔";
    }

    catch(err){

        console.error(err);

        statusText.innerText =
        "❌ Model gagal dimuat";
    }
}

// =====================================
// START CAMERA
// =====================================

async function startCamera(){

    try{

        const stream =
        await navigator.mediaDevices.getUserMedia({

            video:{
                facingMode:"user",
                width:{ ideal:1280 },
                height:{ ideal:720 }
            },

            audio:false
        });

        video.srcObject = stream;

        video.onloadedmetadata = async ()=>{

            await video.play();

            canvas.width =
            video.videoWidth;

            canvas.height =
            video.videoHeight;

            // LOAD MODEL DULU
            await loadModels();

            // BARU START AI
            startDetection();
        };

    }

    catch(err){

        console.error(err);

        statusText.innerText =
        "❌ Kamera gagal";
    }
}

// =====================================
// START DETECTION
// =====================================

function startDetection(){

    statusText.innerText =
    "Scanning Face...";

    setInterval(async ()=>{

        // VIDEO BELUM READY
        if(video.readyState !== 4) return;

        // DETEKSI
        const detections =
        await faceapi
        .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceExpressions();

        // CLEAR
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        // ADA WAJAH
        if(detections){

            const resized =
            faceapi.resizeResults(
                detections,
                {
                    width:canvas.width,
                    height:canvas.height
                }
            );

            const box =
            resized.detection.box;

            // BOX
            ctx.strokeStyle =
            "#00ffff";

            ctx.lineWidth = 3;

            ctx.strokeRect(
                box.x,
                box.y,
                box.width,
                box.height
            );

            // LABEL
            ctx.fillStyle =
            "#00ffff";

            ctx.font =
            "20px Arial";

            ctx.fillText(
                "VESLYN AI",
                box.x,
                box.y - 10
            );

            // EXPRESSION
            const exp =
            detections.expressions;

            detectEmotion(exp);
        }

        // TIDAK ADA WAJAH
        else{

            statusText.innerText =
            "No Face";

            outputText.innerText =
            "Arahkan wajah ke kamera";
        }

    },150);
}

// =====================================
// DETECT EMOTION
// =====================================

function detectEmotion(exp){

    let emotion = "NEUTRAL";
    let text = "Kamu terlihat tenang 😐";

    // HAPPY
    if(exp.happy > 0.7){

        emotion = "HAPPY";
        text = "Kamu terlihat bahagia 😊";
    }

    // ANGRY
    else if(exp.angry > 0.5){

        emotion = "ANGRY";
        text = "Kamu terlihat marah 😠";
    }

    // SAD
    else if(exp.sad > 0.5){

        emotion = "SAD";
        text = "Kamu terlihat sedih 😢";
    }

    // SURPRISED
    else if(exp.surprised > 0.5){

        emotion = "SURPRISED";
        text = "Kamu terlihat terkejut 😲";
    }

    // FEARFUL
    else if(exp.fearful > 0.5){

        emotion = "FEAR";
        text = "Kamu terlihat takut 😨";
    }

    // DISGUSTED
    else if(exp.disgusted > 0.5){

        emotion = "DISGUST";
        text = "Kamu terlihat jijik 🤢";
    }

    // UPDATE UI
    statusText.innerText =
    "Emotion : " + emotion;

    outputText.innerText =
    text;

    // SPEAK SEKALI
    if(lastEmotion !== emotion){

        speak(text);

        lastEmotion = emotion;
    }
}

// =====================================
// AI VOICE
// =====================================

function speak(text){

    speechSynthesis.cancel();

    const speech =
    new SpeechSynthesisUtterance(text);

    speech.lang = "id-ID";
    speech.rate = 1;
    speech.pitch = 1.1;

    speechSynthesis.speak(speech);
}

// =====================================
// START SYSTEM
// =====================================

startCamera();