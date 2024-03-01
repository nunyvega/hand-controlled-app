import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs";
import { runDetection, generateRandomFingerRequirement } from "./utilities";

function App() {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const [model, setModel] = useState(null);
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const [gameMessage, setGameMessage] = useState("Loading model...");
	const [currentFingerRequirement, setCurrentFingerRequirement] = useState(
		generateRandomFingerRequirement()
	);
	const [score, setScore] = useState(0);
	const [gameTime, setGameTime] = useState(10);
	const [gameStarted, setGameStarted] = useState(false);

	useEffect(() => {
		handpose.load().then((loadedModel) => {
			setModel(loadedModel);
			setIsModelLoaded(true);
			setGameMessage("Model loaded. Show your hand to start playing.");
			setCurrentFingerRequirement(generateRandomFingerRequirement());
		});
	}, []);

	useEffect(() => {
		if (!model || !gameStarted) return;

		const intervalId = setInterval(() => {
			runDetection(
				model,
				currentFingerRequirement,
				setScore,
				setCurrentFingerRequirement,
				setGameMessage,
				webcamRef,
				canvasRef
			);
		}, 100);

		return () => clearInterval(intervalId);
	}, [model, gameStarted, currentFingerRequirement, score]);

	useEffect(() => {
		const videoElement = webcamRef.current.video;

		if (videoElement && videoElement.readyState === 4) {
			const videoWidth = videoElement.videoWidth;
			const videoHeight = videoElement.videoHeight;

			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;
		}
	}, [isModelLoaded]); // This effect runs when the model becomes loaded

	// Start game and timer when the user is ready, could be triggered by a button click or automatically
	useEffect(() => {
		if (isModelLoaded && !gameStarted) {
			setGameStarted(true);
			gameTimerCountdown();
		}
	}, [isModelLoaded, gameStarted]);

	const gameTimerCountdown = () => {
		let time = 10; // Reset time to 10 or any desired game time
		setGameTime(time);
		const intervalId = setInterval(() => {
			time--;
			setGameTime(time);
			if (time === 0) {
				clearInterval(intervalId);
				setGameMessage("Game Over! Your final score is " + score);
				setGameStarted(false); // Optionally reset gameStarted to allow restarting the game
			}
		}, 1000);
	};

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
					{/* Button to start game, if using a manual start */}
					{/* <button onClick={startGame}>Start Game</button> */}
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
