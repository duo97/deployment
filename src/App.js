// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load posenet DONE
// 6. Detect function DONE
// 7. Drawing utilities from tensorflow DONE
// 8. Draw functions DONE

// Face Mesh - https://github.com/tensorflow/tfjs-models/tree/master/facemesh

import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
// OLD MODEL
//import * as facemesh from "@tensorflow-models/facemesh";

// NEW MODEL
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import { drawMesh } from "./utilities";
import Game from "./game_of_life";
import axios from 'axios';




function App() {
  const [facedata, setFacedata] = useState([]);
  const [facecolor, setFacecolor] = useState([222, 49, 99]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);


  const [ip, setIP] = useState('');

  //creating function to load ip address from the API
  const getData = async () => {
    const res = await axios.get('https://geolocation-db.com/json/')
    console.log(res.data);
    setIP(res.data.IPv4)
    console.log("got ip",res.data.IPv4);
    
    const IPints=res.data.IPv4.split(".");
    const r=parseInt(IPints[0]);
    const g=parseInt(IPints[1]);
    const b=parseInt(IPints[2]);
    setFacecolor([r,g,b]);
  }
  
  useEffect( () => {
    //passing getData method to the lifecycle method
    getData()
    

  }, [])

  //  Load posenet
  const runFacemesh = async () => {
    // OLD MODEL
    // const net = await facemesh.load({
    //   inputResolution: { width: 640, height: 480 },
    //   scale: 0.8,
    // });
    // NEW MODEL
    const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      // OLD MODEL
      //       const face = await net.estimateFaces(video);
      // NEW MODEL
      const face = await net.estimateFaces({input:video});
      setFacedata(face);
      // console.log(face);

      // Get canvas context
      if (canvasRef.current){
      const ctx = canvasRef.current.getContext("2d");
      
      requestAnimationFrame(()=>{drawMesh(face, ctx)});
      }
    }
  };

  useEffect(()=>{runFacemesh()}, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "5%",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
            opacity: 1.0,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft:"5%",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "left",
            zindex:20,
            width: 640,
            height: 480,
            backgroundColor: "rgba(255, 255, 255, 1)",
            opacity: 1.0,
          }}
        />
        <div
          style={{
            position: "absolute",
            height:"100%",
            width:"100%",
            zindex:100,
            backgroundColor: "rgba(255, 255, 255, 1)",
          }}

        />
         <Game
         
         facedata={facedata}
         facecolor={facecolor}
         style={{
          position: "absolute",
          marginLeft:"auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex:200,
          backgroundColor: "rgba(255, 255, 255, 1)",
        }}
        />
      </header>
    </div>
  );
}

export default App;
