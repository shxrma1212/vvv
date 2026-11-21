/**
 * Face & Smile Detector
 * Uses Google MediaPipe Face Landmarker with Blendshapes for real-time smile detection
 * and facial orientation tracking. Includes graceful fallbacks and smoothing.
 */

export class FaceSmileDetector {
  constructor() {
    this.landmarker = null;
    this.isReady = false;
    this.loading = false;
    this.loadError = null;

    // Smoothed state
    this.smoothedSmile = 0.0;
    this.sensitivity = 1.2; // Multiplier to make gentle smiles register nicely
    this.manualSmileOverride = null; // Used when testing slider

    this.lastVideoTime = -1;
    this.smoothedFace = null;
    this.alpha = 0.22; // Smoothing factor (lower = smoother, higher = faster)
  }

  async init() {
    if (this.isReady || this.loading) return;
    this.loading = true;

    try {
      // Dynamic import from CDN
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
        runningMode: 'VIDEO',
        numFaces: 1
      });

      this.isReady = true;
      this.loading = false;
      console.log('MediaPipe Face Landmarker ready! 🌸');
    } catch (err) {
      console.warn('MediaPipe initialization warning (falling back to lightweight detector):', err);
      this.loadError = err;
      this.loading = false;
      // Graceful fallback is ready automatically
    }
  }

  setSensitivity(val) {
    this.sensitivity = Math.max(0.5, Math.min(2.5, val));
  }

  setManualOverride(val) {
    this.manualSmileOverride = (val === null || val === undefined) ? null : Math.max(0, Math.min(1, val));
  }

  /**
   * Process a single video frame and return smile score & face geometry
   * @param {HTMLVideoElement} video
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @returns {{ smileScore: number, faceData: object|null, rawSmile: number }}
   */
  detect(video, canvasWidth, canvasHeight) {
    // If manual test override is active
    if (this.manualSmileOverride !== null) {
      this.smoothedSmile += (this.manualSmileOverride - this.smoothedSmile) * 0.25;
      const center = { x: canvasWidth * 0.5, y: canvasHeight * 0.45 };
      const simulatedFace = {
        center,
        crown: { x: center.x, y: center.y - 130 },
        faceWidth: 180,
        faceHeight: 230,
        roll: Math.sin(performance.now() * 0.001) * 0.05
      };
      return {
        smileScore: this.smoothedSmile,
        rawSmile: this.manualSmileOverride,
        faceData: simulatedFace
      };
    }

    let rawSmile = 0.0;
    let detectedFace = null;

    if (this.isReady && this.landmarker && video.readyState >= 2) {
      const now = performance.now();
      if (video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = video.currentTime;

        try {
          const results = this.landmarker.detectForVideo(video, now);

          // 1. Extract Smile Blendshapes (mouthSmileLeft, mouthSmileRight)
          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const categories = results.faceBlendshapes[0].categories;
            let smileLeft = 0;
            let smileRight = 0;
            let mouthDimple = 0;

            for (const cat of categories) {
              if (cat.categoryName === 'mouthSmileLeft') smileLeft = cat.score;
              else if (cat.categoryName === 'mouthSmileRight') smileRight = cat.score;
              else if (cat.categoryName === 'mouthDimpleLeft' || cat.categoryName === 'mouthDimpleRight') {
                mouthDimple += cat.score * 0.5;
              }
            }

            // Calculate composite smile score
            const baseSmile = (smileLeft + smileRight) * 0.5;
            rawSmile = Math.min(1.0, (baseSmile + mouthDimple * 0.2) * this.sensitivity);
          }

          // 2. Extract 3D Facial Landmarks (forehead crown, cheeks, eyes, chin)
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const lm = results.faceLandmarks[0];

            // MediaPipe landmarks normalized 0..1
            // Note: Since video is flipped horizontally for mirror view:
            // x_screen = (1 - lm.x) * canvasWidth
            const getPoint = (idx) => ({
              x: (1 - lm[idx].x) * canvasWidth,
              y: lm[idx].y * canvasHeight
            });

            const topForehead = getPoint(10);
            const chin = getPoint(152);
            const leftCheek = getPoint(234);  // Viewer's right when mirrored
            const rightCheek = getPoint(454); // Viewer's left when mirrored
            const leftEye = getPoint(33);
            const rightEye = getPoint(263);

            // Center of face
            const centerX = (leftCheek.x + rightCheek.x) * 0.5;
            const centerY = (topForehead.y + chin.y) * 0.5;

            // Face dimensions
            const faceWidth = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y);
            const faceHeight = Math.hypot(chin.x - topForehead.x, chin.y - topForehead.y);

            // Head roll angle (tilt left/right)
            const roll = Math.atan2(leftEye.y - rightEye.y, leftEye.x - rightEye.x);

            // Crown point positioned slightly above forehead landmark 10
            const crownOffset = faceHeight * 0.18;
            const crownX = topForehead.x - Math.sin(roll) * crownOffset;
            const crownY = topForehead.y - Math.cos(roll) * crownOffset;

            detectedFace = {
              center: { x: centerX, y: centerY },
              crown: { x: crownX, y: crownY },
              faceWidth,
              faceHeight,
              roll,
              leftCheek,
              rightCheek
            };
          }
        } catch (e) {
          console.warn('Detection frame error:', e);
        }
      }
    } else {
      // Lightweight fallback if MediaPipe is not yet ready or offline
      detectedFace = this.fallbackFaceEstimation(video, canvasWidth, canvasHeight);
    }

    // Apply exponential moving average (EMA) smoothing for buttery smooth transitions
    this.smoothedSmile += (rawSmile - this.smoothedSmile) * this.alpha;
    if (this.smoothedSmile < 0.03) this.smoothedSmile = 0.0;

    if (detectedFace) {
      if (!this.smoothedFace) {
        this.smoothedFace = detectedFace;
      } else {
        const fa = 0.35; // Face coordinates smoothing
        this.smoothedFace = {
          center: {
            x: this.smoothedFace.center.x + (detectedFace.center.x - this.smoothedFace.center.x) * fa,
            y: this.smoothedFace.center.y + (detectedFace.center.y - this.smoothedFace.center.y) * fa
          },
          crown: {
            x: this.smoothedFace.crown.x + (detectedFace.crown.x - this.smoothedFace.crown.x) * fa,
            y: this.smoothedFace.crown.y + (detectedFace.crown.y - this.smoothedFace.crown.y) * fa
          },
          faceWidth: this.smoothedFace.faceWidth + (detectedFace.faceWidth - this.smoothedFace.faceWidth) * fa,
          faceHeight: this.smoothedFace.faceHeight + (detectedFace.faceHeight - this.smoothedFace.faceHeight) * fa,
          roll: this.smoothedFace.roll + (detectedFace.roll - this.smoothedFace.roll) * fa
        };
      }
    }

    return {
      smileScore: this.smoothedSmile,
      rawSmile,
      faceData: this.smoothedFace
    };
  }

  /**
   * Lightweight fallback face position centered in viewport
   */
  fallbackFaceEstimation(video, width, height) {
    const center = { x: width * 0.5, y: height * 0.44 };
    const faceW = Math.min(width, height) * 0.32;
    return {
      center,
      crown: { x: center.x, y: center.y - faceW * 0.65 },
      faceWidth: faceW,
      faceHeight: faceW * 1.3,
      roll: 0
    };
  }
}

