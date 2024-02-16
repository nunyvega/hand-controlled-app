//utilities.js
const fingerJoints = {
	thumb: [0, 1, 2, 3, 4],
	indexFinger: [0, 5, 6, 7, 8],
	middleFinger: [0, 9, 10, 11, 12],
	ringFinger: [0, 13, 14, 15, 16],
	pinky: [0, 17, 18, 19, 20],
};

const drawHand = (predictions, ctx) => {
	console.log("inside draw hand");
	if (predictions.length > 0) {
		predictions.forEach((prediction) => {
			const landmarks = prediction.landmarks;
			for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
				let finger = Object.keys(fingerJoints)[j];
				for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
					const firstJointIndex = fingerJoints[finger][k];
					const secondJointIndex = fingerJoints[finger][k + 1];
					ctx.beginPath();
					ctx.moveTo(
						landmarks[firstJointIndex][0],
						landmarks[firstJointIndex][1]
					);
					ctx.lineTo(
						landmarks[secondJointIndex][0],
						landmarks[secondJointIndex][1]
					);
					ctx.strokeStyle = "plum";
					ctx.lineWidth = 4;
					ctx.stroke();
				}
			}
			for (let i = 0; i < landmarks.length; i++) {
				const x = landmarks[i][0];
				const y = landmarks[i][1];
				ctx.beginPath();
				ctx.arc(x, y, 5, 0, 3 * Math.PI);
				ctx.fillStyle = "red";
				ctx.fill();
			}
		});
	}
};

const runDetection = async (
	model,
	currentNumber,
	setScore,
	setCurrentNumber,
	setGameMessage,
	webcamRef,
	canvasRef
) => {
	if (webcamRef.current && webcamRef.current.video.readyState === 4) {
		const video = webcamRef.current.video;
		const hand = await model.estimateHands(video);
		const ctx = canvasRef.current.getContext("2d");
		ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
		drawHand(hand, ctx);

		if (hand.length > 0) {
			const fingersCounted = detectFingers(hand);
			if (fingersCounted === currentNumber) {
				setScore((prevScore) => prevScore + 1);
				const newNumber = Math.floor(Math.random() * 5) + 1;
				setCurrentNumber(newNumber);
				setGameMessage(`Correct! Now show me ${newNumber} fingers.`);
			} else {
				setGameMessage(`Try again! Show me ${currentNumber} fingers.`);
			}
		}
	}
};

const detectFingers = (hand) => {
	console.log("inside detect fingers");

	if (!hand || hand.length === 0) return 0; // No hand detected

	const landmarks = hand[0].landmarks;
	let count = 0;

	// Thumb: Check if the tip is farther on the x-axis from the base
	const thumbIsOpen = landmarks[4][0] > landmarks[3][0];
	if (thumbIsOpen) count++;

	// Other Fingers: Check if the tip is lower on the y-axis than the PIP joint
	const fingers = [8, 12, 16, 20]; // Indices of fingertips for index, middle, ring, and pinky
	fingers.forEach((tipIndex) => {
		const pipIndex = tipIndex - 2;
		if (landmarks[tipIndex][1] < landmarks[pipIndex][1]) {
			count++;
		}
	});

	return count;
};

export { drawHand, detectFingers, runDetection };
