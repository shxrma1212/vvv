/**
 * Vriti's Enchanted Garden - Main Application Controller
 * Made with love exclusively for Vriti 💖
 */

import { FlowerRenderer } from './lilies.js';
import { RomanticAudio } from './audio.js';
import { FaceSmileDetector } from './detector.js';

const VRITI_COMPLIMENTS = [
  "Arey wah Madam jii, aapki smile dekh ke toh saare phool sharma gaye! 🌸✨",
  "Devi jii aap hasti ho na toh pura garden jhoom uthta hai! 💖🌹",
  "Madam jii ki smile ke aage ye saare roses aur sunflowers fail hain! 🌻🥰",
  "Devi jii aapki ye pyaari si smile dekh ke dil garden-garden ho gaya! 🌸💖",
  "Aise hi hasti raha karo Madam jii, aap hasti hui bohot sundar lagti ho! 👑✨",
  "Dekho Devi jii, aapke ek smile pe saare bade-bade phool khil gaye! 🌹🌻🌸",
  "Madam jii, aapki smile humari sabse favorite cheez hai! ☀️💕",
  "Devi jii, aap is pure universe ki sabse pyari ladki ho! 💖✨",
  "Uff Madam jii, itni pyaari smile? Saare phool aapke deewane ho gaye! 🌺👑",
  "Devi jii aap haste raho, hum aapke liye aise hi phool khilate rahenge! 💐💖"
];

class App {
  constructor() {
    this.video = document.getElementById('webcam');
    this.canvas = document.getElementById('overlayCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.renderer = new FlowerRenderer();
    this.audio = new RomanticAudio();
    this.detector = new FaceSmileDetector();

    this.isRunning = false;
    this.lastTime = performance.now();
    this.lastSmileTrigger = 0;
    this.lastComplimentTime = 0;
    this.currentCameraId = null;
    this.availableCameras = [];
    this.noClickCount = 0;
    this.lastNoAttemptTime = 0;

    this.initPrologueSteps();
    this.initUI();
    this.initAudioTriggers();
  }

  /**
   * Multi-Step Romantic Entrance Gateway for Vriti
   * Including the playful "Forgive me or not, Devi jii?" interactive step
   */
  initPrologueSteps() {
    this.prologueOverlay = document.getElementById('prologueOverlay');
    this.step1 = document.getElementById('prologueStep1');
    this.step2 = document.getElementById('prologueStep2');
    this.step3 = document.getElementById('prologueStep3');

    const btnOpenLetter = document.getElementById('btnOpenLetter');
    const btnYesForgive = document.getElementById('btnYesForgive');
    const btnNoForgive = document.getElementById('btnNoForgive');
    const deviPleaBubble = document.getElementById('deviPleaBubble');
    const deviPleaText = document.getElementById('deviPleaText');
    const noBtnLabel = document.getElementById('noBtnLabel');
    const btnEnterGarden = document.getElementById('btnEnterGarden');

    const DEVI_PLEAS = [
      "Pls maaf krdo Devi jii 🥺🙏",
      "Arey Devi jii aise mat karo na... sachhi sorry! 😭💔",
      "Kaan pakad ke sorry bol raha hu Devi jii 🙇‍♂️🌸",
      "Dekho Lilies, Roses, Sunflowers sab aapke liye laye hain... ab to maaf krdo Devi jii 🌹🌻",
      "Pls pls pls maaf krdo na Devi jii, aapke bina garden soona hai 🥺💖",
      "Ab toh 'No' button bhi thak gaya bol raha hai ki maaf krdo Devi jii! 🥰"
    ];

    const NO_POSITIONS = [
      { x: -75, y: 30 },
      { x: 80, y: -25 },
      { x: -85, y: -28 },
      { x: 90, y: 32 },
      { x: 0, y: 55 }
    ];

    // Step 1 -> Step 2
    if (btnOpenLetter) {
      btnOpenLetter.addEventListener('click', () => {
        this.audio.playPop();
        this.step1.classList.remove('active');
        this.step2.classList.add('active');
      });
    }

    // Playful runaway "No" button handler
    const handleNoAttempt = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const now = performance.now();
      if (now - this.lastNoAttemptTime < 280) return;
      this.lastNoAttemptTime = now;

      this.noClickCount++;
      this.audio.playPop();

      // Get Hindi plea message
      const pleaIdx = Math.min(this.noClickCount - 1, DEVI_PLEAS.length - 1);
      if (deviPleaText) {
        deviPleaText.textContent = DEVI_PLEAS[pleaIdx];
      }

      // Re-trigger plea bubble bounce animation
      if (deviPleaBubble) {
        deviPleaBubble.classList.remove('show');
        void deviPleaBubble.offsetWidth; // Force reflow
        deviPleaBubble.classList.add('show');
      }

      // Grow the "Yes" button progressively
      if (btnYesForgive) {
        const scale = 1.0 + Math.min(this.noClickCount * 0.16, 0.85);
        btnYesForgive.style.transform = `scale(${scale})`;
        btnYesForgive.style.boxShadow = `0 10px 35px rgba(214, 34, 108, ${0.4 + this.noClickCount * 0.08})`;
      }

      // Dodge the "No" button to a new position
      if (btnNoForgive) {
        let pos;
        if (this.noClickCount <= NO_POSITIONS.length) {
          pos = NO_POSITIONS[this.noClickCount - 1];
        } else {
          pos = {
            x: (Math.random() - 0.5) * 160,
            y: (Math.random() - 0.5) * 60
          };
        }
        btnNoForgive.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

        // Update button label after multiple attempts
        if (noBtnLabel) {
          if (this.noClickCount >= 5) {
            noBtnLabel.textContent = "Ab toh Yes hi daba do! 🥺";
          } else if (this.noClickCount >= 3) {
            noBtnLabel.textContent = "Arey Devi jii! 🥺";
          }
        }
      }
    };

    if (btnNoForgive) {
      // Listen to both hover and touch/click attempts
      btnNoForgive.addEventListener('mouseenter', handleNoAttempt);
      btnNoForgive.addEventListener('touchstart', handleNoAttempt, { passive: false });
      btnNoForgive.addEventListener('pointerdown', handleNoAttempt);
      btnNoForgive.addEventListener('click', handleNoAttempt);
    }

    // Step 2 -> Step 3 (When she forgives)
    if (btnYesForgive) {
      btnYesForgive.addEventListener('click', () => {
        this.audio.playSmileChime(1.0);
        this.showToast("Yayyy! Thank you so much Madam jii! 💖", 3500);

        this.step2.classList.remove('active');
        this.step3.classList.add('active');
      });
    }

    // Step 3 -> Enter Garden
    if (btnEnterGarden) {
      btnEnterGarden.addEventListener('click', () => {
        this.audio.playSmileChime(1.0);
        // Start romantic ambient background melody automatically for Vriti!
        this.audio.toggleAmbient(true);
        if (this.btnMusic) {
          this.btnMusic.classList.add('active');
        }

        // Smooth fade out of prologue gateway
        this.prologueOverlay.classList.add('fade-out');
        setTimeout(() => {
          this.prologueOverlay.style.display = 'none';
        }, 800);

        // Start camera
        this.startCamera();
      });
    }
  }

  initUI() {
    this.meterFill = document.getElementById('loveMeterFill');
    this.meterPercent = document.getElementById('loveMeterPercent');
    this.meterStatus = document.getElementById('loveMeterStatus');
    this.cameraContainer = document.getElementById('cameraContainer');
    this.toastEl = document.getElementById('loveToast');
    this.complimentCard = document.getElementById('complimentCard');
    this.complimentText = document.getElementById('complimentText');

    this.btnMusic = document.getElementById('btnMusic');
    this.btnSnap = document.getElementById('btnSnap');
    this.btnSwitchCam = document.getElementById('btnSwitchCam');

    if (this.btnMusic) {
      this.btnMusic.addEventListener('click', () => {
        const isPlaying = this.audio.toggleAmbient();
        this.btnMusic.classList.toggle('active', isPlaying);
        this.audio.playPop();
      });
    }

    if (this.btnSnap) {
      this.btnSnap.addEventListener('click', () => {
        this.takeSnapshot();
      });
    }

    if (this.btnSwitchCam) {
      this.btnSwitchCam.addEventListener('click', () => {
        this.switchCamera();
      });
    }

    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resizeCanvas(), 300);
    });
  }

  initAudioTriggers() {
    const unlock = () => {
      this.audio.resume();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  async startCamera(deviceId = null) {
    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = stream;

      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
      });

      this.resizeCanvas();

      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.availableCameras = devices.filter(d => d.kind === 'videoinput');
        if (this.btnSwitchCam) {
          this.btnSwitchCam.style.display = this.availableCameras.length > 1 ? 'inline-flex' : 'none';
        }
      }

      this.showToast("Welcome to your garden, Devi jii! 🌸💖", 4000);

      this.detector.init().then(() => {
        console.log("Smile detector initialized for Vriti! 🌸");
      });

      if (!this.isRunning) {
        this.isRunning = true;
        requestAnimationFrame((t) => this.loop(t));
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      this.showCameraFallbackNotice(err);
      this.resizeCanvas();

      if (!this.isRunning) {
        this.isRunning = true;
        requestAnimationFrame((t) => this.loop(t));
      }
    }
  }

  async switchCamera() {
    if (this.availableCameras.length <= 1) return;
    const currentIdx = this.availableCameras.findIndex(c => c.deviceId === this.currentCameraId);
    const nextIdx = (currentIdx + 1) % this.availableCameras.length;
    this.currentCameraId = this.availableCameras[nextIdx].deviceId;

    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(t => t.stop());
    }
    await this.startCamera(this.currentCameraId);
  }

  showCameraFallbackNotice() {
    const notice = document.getElementById('cameraNotice');
    if (notice) {
      notice.style.display = 'block';
      notice.innerHTML = `
        <div class="notice-inner">
          <span class="notice-icon">📷✨</span>
          <h4>Allow Camera For Vriti</h4>
          <p>Please allow camera permissions in your browser so the garden can see Vriti's radiant smile!</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Allow Camera 🌸</button>
        </div>
      `;
    }
  }

  resizeCanvas() {
    const rect = this.video.getBoundingClientRect();
    const width = this.video.videoWidth || rect.width || 640;
    const height = this.video.videoHeight || rect.height || 480;

    // Retina / High DPI scaling for buttery smooth rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  loop(currentTime) {
    const dt = Math.min(0.08, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    const width = this.displayWidth || this.canvas.width;
    const height = this.displayHeight || this.canvas.height;

    const { smileScore, faceData } = this.detector.detect(
      this.video,
      width,
      height
    );

    // Clear frame
    this.ctx.clearRect(0, 0, width, height);

    // Render Lilies, Roses, and Sunflowers around Vriti
    this.renderer.render(
      this.ctx,
      width,
      height,
      faceData,
      smileScore,
      dt
    );

    // Update Vriti's Smile & Love Meter
    this.updateLoveMeter(smileScore);

    // Chime & sweet whisper when Vriti smiles
    if (smileScore > 0.42 && currentTime - this.lastSmileTrigger > 2200) {
      this.lastSmileTrigger = currentTime;
      this.audio.playSmileChime(smileScore);
      this.triggerCompliment();
    }

    if (this.isRunning) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  updateLoveMeter(smile) {
    const percent = Math.round(smile * 100);

    if (this.meterFill) {
      this.meterFill.style.width = `${percent}%`;
    }
    if (this.meterPercent) {
      this.meterPercent.textContent = `${percent}%`;
    }

    if (this.meterStatus) {
      let statusText = "Looking at you Devi jii... ek pyaari si smile do na? 🥺💕";
      if (percent >= 80) {
        statusText = "Full Bloom of Love! Devi jii aap bohot bohot khoobsurat lag rahi ho! 👑🌹🌻💖";
      } else if (percent >= 60) {
        statusText = "Arey wah Madam jii! Aaspas saare bade-bade phool khil gaye! 🌺✨";
      } else if (percent >= 35) {
        statusText = "Kya baat hai Devi jii! Roses aur Sunflowers jhoom rahe hain! 🌹🌻";
      } else if (percent >= 12) {
        statusText = "Aww, Madam jii ke chehre pe thodi si smile aayi! Phool jag rahe hain! 🌸";
      }
      this.meterStatus.textContent = statusText;
    }

    if (this.cameraContainer) {
      const glow = 10 + smile * 35;
      const alpha = 0.35 + smile * 0.65;
      this.cameraContainer.style.boxShadow = `0 15px 45px rgba(255, 105, 180, ${alpha}), 0 0 ${glow}px rgba(255, 182, 193, ${alpha * 0.9})`;
    }
  }

  triggerCompliment() {
    const now = performance.now();
    if (now - this.lastComplimentTime < 4200) return;
    this.lastComplimentTime = now;

    const randomMsg = VRITI_COMPLIMENTS[Math.floor(Math.random() * VRITI_COMPLIMENTS.length)];

    if (this.complimentCard && this.complimentText) {
      this.complimentText.textContent = randomMsg;
      this.complimentCard.classList.add('visible');

      setTimeout(() => {
        if (this.complimentCard) {
          this.complimentCard.classList.remove('visible');
        }
      }, 3800);
    }
  }

  showToast(msg, duration = 3000) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, duration);
  }

  /**
   * Captures a keepsake souvenir photo of Vriti in her garden
   */
  takeSnapshot() {
    this.audio.playPop();

    const w = this.displayWidth || this.canvas.width;
    const h = this.displayHeight || this.canvas.height;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = w;
    snapCanvas.height = h;
    const sCtx = snapCanvas.getContext('2d');

    // 1. Mirrored video
    sCtx.save();
    sCtx.translate(w, 0);
    sCtx.scale(-1, 1);
    try {
      sCtx.drawImage(this.video, 0, 0, w, h);
    } catch (e) {
      const bgGrad = sCtx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#ffd6e0');
      bgGrad.addColorStop(1, '#ffb6c1');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, w, h);
    }
    sCtx.restore();

    // 2. Flowers overlay
    sCtx.drawImage(this.canvas, 0, 0, w, h);

    // 3. Romantic keepsake watermark for Vriti
    sCtx.save();
    const vig = sCtx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
    vig.addColorStop(0, 'rgba(255, 255, 255, 0)');
    vig.addColorStop(1, 'rgba(255, 182, 193, 0.45)');
    sCtx.fillStyle = vig;
    sCtx.fillRect(0, 0, w, h);

    sCtx.fillStyle = '#ffffff';
    sCtx.shadowColor = 'rgba(214, 34, 108, 0.9)';
    sCtx.shadowBlur = 10;
    sCtx.font = `italic 700 ${Math.max(18, Math.round(w * 0.038))}px "Playfair Display", Georgia, serif`;
    sCtx.textAlign = 'center';
    sCtx.fillText("🌸 For My Beloved Devi Jii Vriti • Forever Blooming 💖", w * 0.5, h - 35);

    const today = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    sCtx.font = `500 ${Math.max(12, Math.round(w * 0.022))}px sans-serif`;
    sCtx.fillText(`Made With Love For Madam Jii • ${today}`, w * 0.5, h - 14);
    sCtx.restore();

    // Screen flash
    const flash = document.createElement('div');
    flash.className = 'photo-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Download image
    const dataUrl = snapCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Vriti-DeviJii-Blooming-Moment-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    this.showToast("Saved Madam jii's blooming moment! 📸💖", 3500);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.vritiGardenApp = new App();
});
