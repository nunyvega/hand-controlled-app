import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
import { runDetection } from "./utilities";

function App() {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const [model, setModel] = useState(null);
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const [gameMessage, setGameMessage] = useState("Loading model...");
	const [currentNumber, setCurrentNumber] = useState(1);
	const [score, setScore] = useState(0);
	const [gameTime, setGameTime] = useState(10);
	const [gameStarted, setGameStarted] = useState(false);

	// not used yet
	const gameTimerCountdown = () => {
		let time = 10;
		const intervalId = setInterval(() => {
			time--;
			setGameTime(time);
			if (time === 0) {
				clearInterval(intervalId);
				setGameMessage("Game Over! Your final score is " + score);
			}
		}, 1000);
	};

	useEffect(() => {
		handpose.load().then((loadedModel) => {
			setModel(loadedModel);
			setIsModelLoaded(true);
			setGameMessage("Model loaded. Show your hand to start playing.");
			setCurrentNumber(Math.floor(Math.random() * 5) + 1);
		});
	}, []);

	useEffect(() => {
		if (!model) return;

		const intervalId = setInterval(() => {
			runDetection(
				model,
				currentNumber,
				setScore,
				setCurrentNumber,
				setGameMessage,
				webcamRef,
				canvasRef,
				setGameStarted
			);
		}, 100);

		return () => clearInterval(intervalId);
	}, [model, currentNumber, score]);

	useEffect(() => {
		const videoElement = webcamRef.current.video;

		if (videoElement && videoElement.readyState === 4) {
			// Video dimensions are known, set canvas dimensions to match
			const videoWidth = videoElement.videoWidth;
			const videoHeight = videoElement.videoHeight;

			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;
		}
	}, [isModelLoaded]); // This effect runs when the model becomes loaded

	return (
		<div className="App">
			<header className="App-header">
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						flexDirection: "column",
					}}
				>
					<h1
						style={{
							width: "100%",
							fontSize: "2rem",
							marginBottom: "1rem",
							textAlign: "center",
						}}
					>
						Counting Fingers Game
					</h1>
					<p
						style={{
							fontSize: "1.5rem",
							marginBottom: "1rem",
							textAlign: "center",
						}}
					>
						Score: {score}
					</p>
					<p
						style={{
							fontSize: "1.2rem",
							marginBottom: "2rem",
							textAlign: "center",
						}}
					>
						{gameMessage}
					</p>
					<p
						style={{
							fontSize: "1.5rem",
							marginBottom: "1rem",
							textAlign: "center",
						}}
					>
						Time: {gameTime}
					</p>
				</div>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<Webcam
						ref={webcamRef}
						style={{
							position: "absolute",
							marginLeft: "2rem",

							width: 640,
							height: 480,
							borderRadius: "10px",
							boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
						}}
					/>
					<canvas
						ref={canvasRef}
						style={{
							position: "absolute",
							marginLeft: "2rem",
							width: 640,
							height: 480,
							borderRadius: "10px",
							boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
						}}
					/>
				</div>
			</header>
		</div>
	);
}

export default App;
