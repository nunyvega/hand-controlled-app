// utilities.js
const fingerJoints = {
	thumb: [0, 1, 2, 3, 4],
	indexFinger: [0, 5, 6, 7, 8],
	middleFinger: [0, 9, 10, 11, 12],
	ringFinger: [0, 13, 14, 15, 16],
	pinky: [0, 17, 18, 19, 20],
};

const drawHand = (predictions, ctx) => {
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

const detectFingers = (hand) => {
	if (!hand || hand.length === 0)
		return {
			thumb: false,
			index: false,
			middle: false,
			ring: false,
			pinky: false,
		};

	const landmarks = hand[0].landmarks;
	let fingerStates = {
		thumb: landmarks[4][0] > landmarks[0][0], // Consider thumb's unique orientation
		index: landmarks[8][1] < landmarks[7][1],
		middle: landmarks[12][1] < landmarks[11][1],
		ring: landmarks[16][1] < landmarks[15][1],
		pinky: landmarks[20][1] < landmarks[19][1],
	};

	return fingerStates;
};

const generateRandomFingerRequirement = () => {
	return {
		thumb: Math.random() < 0.5,
		index: Math.random() < 0.5,
		middle: Math.random() < 0.5,
		ring: Math.random() < 0.5,
		pinky: Math.random() < 0.5,
	};
};

const fingerRequirementToString = (requirement) => {
	return Object.entries(requirement)
		.filter(([_, isRequired]) => isRequired)
		.map(([finger]) => finger.charAt(0).toUpperCase() + finger.slice(1))
		.join(", ");
};

const runDetection = async (
	model,
	currentFingerRequirement,
	setScore,
	setCurrentFingerRequirement,
	setGameMessage,
	webcamRef,
	canvasRef
) => {
	if (webcamRef.current && webcamRef.current.video.readyState === 4) {
		const video = webcamRef.current.video;
		const hand = await model.estimateHands(video);
		const ctx = canvasRef.current.getContext("2d");
		ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		drawHand(hand, ctx);

		if (hand.length > 0) {
			const fingerStates = detectFingers(hand);
			const isCorrect = Object.keys(currentFingerRequirement).every(
				(finger) =>
					fingerStates[finger] === currentFingerRequirement[finger]
			);

			if (isCorrect) {
				setScore((prevScore) => prevScore + 1);
				const newRequirement = generateRandomFingerRequirement();
				setCurrentFingerRequirement(newRequirement);
				setGameMessage(
					`Correct! Now show me: ${fingerRequirementToString(
						newRequirement
					)}`
				);
			} else {
				setGameMessage(
					`Try again! Show me: ${fingerRequirementToString(
						currentFingerRequirement
					)}`
				);
			}
		}
	}
};

export {
	drawHand,
	detectFingers,
	runDetection,
	generateRandomFingerRequirement,
	fingerRequirementToString,
};
