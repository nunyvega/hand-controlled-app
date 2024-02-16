import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import React, { useRef } from "react";
import { drawHand, detect } from "./utilities";
import { detectGesture } from "./gestures";

function App() {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	const runHandpose = async () => {
		const net = await handpose.load();
		console.log("Handpose model loaded.");
		setInterval(() => {
			detect(net, webcamRef, canvasRef);
		}, 100);
	};

	runHandpose();

	return (
		<div className="App">
			<header className="App-header">
				<Webcam
					ref={webcamRef}
					style={{
						position: "absolute",
						marginLeft: "auto",
						marginRight: "auto",
						left: 0,
						right: 0,
						textAlign: "center",
						zIndex: 9,
						width: 640,
						height: 480,
					}}
				/>
				<canvas
					ref={canvasRef}
					style={{
						position: "absolute",
						marginLeft: "auto",
						marginRight: "auto",
						left: 0,
						right: 0,
						textAlign: "center",
						zIndex: 9,
						width: 640,
						height: 480,
					}}
				/>
			</header>
		</div>
	);
}

export default App;
