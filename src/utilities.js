import { detectGesture } from "./gestures";

const fingerJoints = {
	thumb: [0, 1, 2, 3, 4],
	indexFinger: [0, 5, 6, 7, 8],
	middleFinger: [0, 9, 10, 11, 12],
	ringFinger: [0, 13, 14, 15, 16],
	pinky: [0, 17, 18, 19, 20],
};

const drawHand = (predictions, ctx) => {
	// Check if we have predictions
	if (predictions.length > 0) {
		predictions.forEach((prediction) => {
			// Draw landmarks
			const landmarks = prediction.landmarks;

			// Loop through fingers
			for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
				let finger = Object.keys(fingerJoints)[j];
				//  Loop through pairs of joints
				for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
					// Get pairs of joints
					const firstJointIndex = fingerJoints[finger][k];
					const secondJointIndex = fingerJoints[finger][k + 1];

					// Draw path
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

			// Loop through landmarks and draw em
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

const detect = async (net, webcamRef, canvasRef) => {
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

		// Set canvas height and width
		canvasRef.current.width = videoWidth;
		canvasRef.current.height = videoHeight;

		// Make Detections
		const hand = await net.estimateHands(video);

		// Draw mesh
		const ctx = canvasRef.current.getContext("2d");
		drawHand(hand, ctx);
		hand && detectGesture(hand);
	}
};

export { drawHand, detect };
