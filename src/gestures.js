const gestures = {
	closedFist: {
		thumb: "closed",
		indexFinger: "closed",
		middleFinger: "closed",
		ringFinger: "closed",
		pinkyFinger: "closed",
	},
	fist: {
		thumb: "closed",
		indexFinger: "closed",
		middleFinger: "closed",
		ringFinger: "closed",
		pinkyFinger: "closed",
	},
	openHand: {
		thumb: "open",
		indexFinger: "open",
		middleFinger: "open",
		ringFinger: "open",
		pinkyFinger: "open",
	},
	peaceSign: {
		thumb: "open",
		indexFinger: "open",
		middleFinger: "closed",
		ringFinger: "closed",
		pinkyFinger: "open",
	},
	thumbsUp: {
		thumb: "up",
		indexFinger: "up",
		middleFinger: "up",
		ringFinger: "up",
		pinkyFinger: "up",
	},
	thumbsDown: {
		thumb: "down",
		indexFinger: "down",
		middleFinger: "down",
		ringFinger: "down",
		pinkyFinger: "down",
	},
};

function detectGesture(predictions) {
	if (predictions.length > 0 && predictions[0] !== undefined) {
		const landmarks = predictions[0].landmarks;
		const thumb = landmarks[4];
		const indexFinger = landmarks[8];
		const middleFinger = landmarks[12];
		const ringFinger = landmarks[16];
		const pinkyFinger = landmarks[20];

		const fingers = {
			thumb,
			indexFinger,
			middleFinger,
			ringFinger,
			pinkyFinger,
		};

		const gesture = {};

		//detect if finger is open or closed, up or down
		for (let finger in fingers) {
			if (fingers[finger][1] < fingers.thumb[1]) {
				gesture[finger] = "up";
			} else {
				gesture[finger] = "closed";
			}
		}

		// detect gesture by comparing it with the gestures object
		for (let key in gestures) {
			let detected = true;
			for (let finger in gestures[key]) {
				if (gestures[key][finger] !== gesture[finger]) {
					detected = false;
				}
			}
			if (detected) {
				console.log(key);
				return key;
			}
		}

		return gesture;
	} else {
		return {};
	}
}

export { gestures, detectGesture };
