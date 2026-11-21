/**
 * Vriti's Enchanted Garden - Floral & Particle Rendering Engine
 * Dedicated to Vriti (Devi jii / Madam jii) 💖
 * When Devi jii smiles, massive blooming Lilies, velvety Roses, and golden Sunflowers
 * expand to cover all the spaces around her in a magnificent fairytale floral arch!
 */

export class FlowerRenderer {
  constructor() {
    this.petals = [];
    this.sparkles = [];
    this.orbitingFlowers = [];
    this.maxPetals = 45;
    this.maxSparkles = 55;
    this.time = 0;

    this.initOrbitingFlowers();
  }

  initOrbitingFlowers() {
    this.orbitingFlowers = [];
    // 10 orbiting flowers: alternating lily, rose, sunflower!
    const types = ['lily', 'rose', 'sunflower', 'rose', 'lily', 'sunflower'];
    const count = 10;
    for (let i = 0; i < count; i++) {
      this.orbitingFlowers.push({
        type: types[i % types.length],
        baseAngle: (i / count) * Math.PI * 2,
        speed: 0.28 + Math.random() * 0.28,
        radiusX: 0.52 + Math.random() * 0.26,
        radiusY: 0.42 + Math.random() * 0.22,
        baseSize: 34 + Math.random() * 22,
        wobbleSpeed: 1 + Math.random(),
        wobbleAmp: 12 + Math.random() * 8,
        rotationSpeed: (Math.random() - 0.5) * 0.6
      });
    }
  }

  /**
   * Main render loop
   */
  render(ctx, width, height, faceData, smileScore, dt) {
    this.time += dt;

    // Bloom factor: from gentle tiny buds (0.15) to glorious full bloom (1.0)
    const bloom = Math.min(1.0, 0.15 + smileScore * 0.85);

    ctx.save();

    // 1. Draw ALL SURROUNDING SPACES with BIG Flowers when Devi jii smiles!
    // (Full bottom carpet, left climbing wall, right climbing wall, top floral canopy arch)
    this.drawAllSurroundingFlowers(ctx, width, height, bloom, smileScore);

    // 2. Draw Orbiting Halo Flowers (encircling Devi jii with 3D depth)
    this.drawOrbitingHalo(ctx, width, height, faceData, bloom, smileScore);

    // 3. Draw Vriti's Royal Floral Crown (intertwined big lilies, roses & sunflowers)
    if (faceData) {
      this.drawFloralCrown(ctx, faceData, bloom, smileScore);
    }

    // 4. Update and Draw Falling Mixed Petals
    this.updateAndDrawPetals(ctx, width, height, smileScore, dt);

    // 5. Update and Draw Romantic Hearts & Golden Sparkles
    this.updateAndDrawSparkles(ctx, width, height, faceData, smileScore, dt);

    ctx.restore();
  }

  /**
   * Universal flower drawer
   */
  drawFlower(ctx, type, x, y, size, angle, bloom, tilt = 0) {
    if (type === 'rose') {
      this.drawSingleRose(ctx, x, y, size, angle, bloom, tilt);
    } else if (type === 'sunflower') {
      this.drawSingleSunflower(ctx, x, y, size, angle, bloom, tilt);
    } else {
      this.drawSingleLily(ctx, x, y, size, angle, bloom, tilt);
    }
  }

  /**
   * 🌸 DRAW BOTANICAL LILY
   */
  drawSingleLily(ctx, cx, cy, radius, angle = 0, bloom = 1.0, tilt = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    if (tilt !== 0) ctx.scale(1, Math.cos(tilt * 0.7));

    const effectiveRadius = radius * (0.35 + bloom * 0.65);

    // Soft celestial glow when in full bloom
    if (bloom > 0.35) {
      ctx.save();
      const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, effectiveRadius * 1.35);
      glowGrad.addColorStop(0, 'rgba(255, 105, 180, 0.45)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, effectiveRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Outer 3 Sepals
    for (let i = 0; i < 3; i++) {
      const pAngle = (i * 2 * Math.PI) / 3 + Math.PI / 6;
      this.drawLilyPetal(ctx, pAngle, effectiveRadius * 0.95, effectiveRadius * 0.32, bloom, false);
    }

    // Inner 3 Petals
    for (let i = 0; i < 3; i++) {
      const pAngle = (i * 2 * Math.PI) / 3;
      this.drawLilyPetal(ctx, pAngle, effectiveRadius, effectiveRadius * 0.42, bloom, true);
    }

    // Throat & stamens
    if (bloom > 0.22) {
      this.drawLilyCenter(ctx, effectiveRadius * 0.32 * bloom, bloom);
    }

    ctx.restore();
  }

  drawLilyPetal(ctx, angle, length, width, bloom, isInner) {
    ctx.save();
    ctx.rotate(angle);

    const curvelength = length * (0.6 + bloom * 0.4);
    const midWidth = width * (0.4 + bloom * 0.6);
    const tipRecurve = (1.0 - bloom) * 0.4;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -midWidth * 0.9, curvelength * 0.35,
      -midWidth * 0.8, curvelength * 0.75,
      0, curvelength * (1.0 - tipRecurve * 0.15)
    );
    ctx.bezierCurveTo(
      midWidth * 0.8, curvelength * 0.75,
      midWidth * 0.9, curvelength * 0.35,
      0, 0
    );
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, curvelength);
    grad.addColorStop(0, '#a8e063');
    grad.addColorStop(0.2, '#d6226c');
    grad.addColorStop(0.65, '#ff69b4');
    grad.addColorStop(0.9, '#ffffff');
    grad.addColorStop(1.0, '#fff5f8');

    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 5;
    ctx.fill();

    // Central vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, curvelength * 0.5, 0, curvelength * 0.85);
    ctx.strokeStyle = '#d6226c';
    ctx.lineWidth = Math.max(1, width * 0.04);
    ctx.stroke();

    // Speckles
    if (isInner && bloom > 0.4) {
      ctx.fillStyle = '#8b004f';
      const dotCount = Math.floor(6 + bloom * 8);
      for (let d = 0; d < dotCount; d++) {
        const dotY = (0.15 + (d / dotCount) * 0.45) * curvelength;
        const spread = Math.sin(d * 2.3) * midWidth * 0.28;
        ctx.beginPath();
        ctx.arc(spread, dotY, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawLilyCenter(ctx, throatRadius, bloom) {
    ctx.save();
    const throatGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, throatRadius);
    throatGrad.addColorStop(0, '#56ab2f');
    throatGrad.addColorStop(0.7, '#a8e063');
    throatGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = throatGrad;
    ctx.beginPath();
    ctx.arc(0, 0, throatRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6 Stamens with golden pollen
    const stamenLen = throatRadius * 2.4 * bloom;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + 0.15;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const endX = (i % 2 === 0 ? 3.5 : -3.5);
      ctx.quadraticCurveTo(Math.sin(i) * 2, stamenLen * 0.5, endX, stamenLen);
      ctx.strokeStyle = '#c9e6a2';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Golden anther
      ctx.translate(endX, stamenLen);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#b34700';
      ctx.fillRect(-3, -1.5, 6, 3);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(-1.5, -1, 3, 2);
      ctx.restore();
    }
  }

  /**
   * 🌹 DRAW VELVETY ROMANTIC ROSE
   */
  drawSingleRose(ctx, cx, cy, radius, angle = 0, bloom = 1.0, tilt = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    if (tilt !== 0) ctx.scale(1, Math.cos(tilt * 0.7));

    const r = radius * (0.4 + bloom * 0.6);

    // Soft crimson glow
    if (bloom > 0.35) {
      ctx.save();
      const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r * 1.3);
      glowGrad.addColorStop(0, 'rgba(230, 0, 73, 0.4)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Outer whorl of 5 large velvety petals
    const outerCount = 5;
    for (let i = 0; i < outerCount; i++) {
      const a = (i * 2 * Math.PI) / outerCount;
      this.drawRosePetal(ctx, a, r * 0.95, r * 0.72, '#d6004b', '#ff4d79', '#ff99b3');
    }

    // Middle whorl of 5 overlapping petals
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 + Math.PI / 5;
      this.drawRosePetal(ctx, a, r * 0.75, r * 0.6, '#b8003f', '#e60049', '#ff6b93');
    }

    // Inner whorl of 4 tightly curved petals
    for (let i = 0; i < 4; i++) {
      const a = (i * 2 * Math.PI) / 4 + Math.PI / 4;
      this.drawRosePetal(ctx, a, r * 0.52, r * 0.46, '#990033', '#c70039', '#ff4d79');
    }

    // Center swirl bud
    ctx.save();
    const budGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 0.28);
    budGrad.addColorStop(0, '#59001e');
    budGrad.addColorStop(0.7, '#990033');
    budGrad.addColorStop(1, '#c70039');
    ctx.fillStyle = budGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2);
    ctx.fill();

    // Spiral curl
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0.2, Math.PI * 1.4);
    ctx.strokeStyle = '#ff85a2';
    ctx.lineWidth = Math.max(1.2, r * 0.05);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(r * 0.04, -r * 0.02, r * 0.08, Math.PI * 0.8, Math.PI * 2);
    ctx.strokeStyle = '#ffc2d1';
    ctx.lineWidth = Math.max(1, r * 0.04);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  drawRosePetal(ctx, angle, distance, size, deepColor, midColor, edgeColor) {
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, distance * 0.5);

    ctx.beginPath();
    ctx.moveTo(-size * 0.6, 0);
    ctx.bezierCurveTo(
      -size * 0.8, distance * 0.6,
      size * 0.8, distance * 0.6,
      size * 0.6, 0
    );
    ctx.bezierCurveTo(
      size * 0.3, -distance * 0.4,
      -size * 0.3, -distance * 0.4,
      -size * 0.6, 0
    );
    ctx.closePath();

    const pGrad = ctx.createRadialGradient(0, 0, size * 0.2, 0, distance * 0.3, size * 0.8);
    pGrad.addColorStop(0, deepColor);
    pGrad.addColorStop(0.6, midColor);
    pGrad.addColorStop(1, edgeColor);

    ctx.fillStyle = pGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 4;
    ctx.fill();

    ctx.restore();
  }

  /**
   * 🌻 DRAW RADIANT GOLDEN SUNFLOWER
   */
  drawSingleSunflower(ctx, cx, cy, radius, angle = 0, bloom = 1.0, tilt = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    if (tilt !== 0) ctx.scale(1, Math.cos(tilt * 0.7));

    const r = radius * (0.4 + bloom * 0.6);

    // Warm golden sunshine glow
    if (bloom > 0.35) {
      ctx.save();
      const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r * 1.38);
      glowGrad.addColorStop(0, 'rgba(255, 193, 7, 0.45)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const petalCount = 18;
    const petalLen = r * 0.95;
    const petalWid = r * 0.22;

    for (let i = 0; i < petalCount; i++) {
      const a = (i * 2 * Math.PI) / petalCount;
      this.drawSunflowerPetal(ctx, a, petalLen, petalWid, '#f59e0b', '#fbbf24', '#fef08a');
    }

    for (let i = 0; i < petalCount; i++) {
      const a = (i * 2 * Math.PI) / petalCount + Math.PI / petalCount;
      this.drawSunflowerPetal(ctx, a, petalLen * 0.85, petalWid * 0.85, '#d97706', '#f59e0b', '#fde047');
    }

    // Disc
    const discRadius = r * 0.42;
    ctx.save();
    const discGrad = ctx.createRadialGradient(0, 0, discRadius * 0.2, 0, 0, discRadius);
    discGrad.addColorStop(0, '#2d1607');
    discGrad.addColorStop(0.7, '#451a03');
    discGrad.addColorStop(0.92, '#78350f');
    discGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.arc(0, 0, discRadius, 0, Math.PI * 2);
    ctx.fill();

    const seedCount = Math.floor(25 + bloom * 35);
    const goldenAngle = 2.39996;
    ctx.fillStyle = '#f59e0b';
    for (let s = 1; s <= seedCount; s++) {
      const rad = Math.sqrt(s / seedCount) * (discRadius * 0.88);
      const theta = s * goldenAngle;
      const sx = Math.cos(theta) * rad;
      const sy = Math.sin(theta) * rad;
      const dotSize = (s > seedCount * 0.7) ? 1.2 : 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  drawSunflowerPetal(ctx, angle, length, width, baseColor, midColor, tipColor) {
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-width * 0.6, length * 0.45, 0, length);
    ctx.quadraticCurveTo(width * 0.6, length * 0.45, 0, 0);
    ctx.closePath();

    const pGrad = ctx.createLinearGradient(0, 0, 0, length);
    pGrad.addColorStop(0, baseColor);
    pGrad.addColorStop(0.5, midColor);
    pGrad.addColorStop(1, tipColor);

    ctx.fillStyle = pGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 4;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, length * 0.15);
    ctx.lineTo(0, length * 0.85);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 👑 VRITI'S FLORAL CROWN
   */
  drawFloralCrown(ctx, face, bloom, smileScore) {
    if (!face || !face.crown) return;

    const { crown, roll = 0, faceWidth = 140 } = face;
    // Scales up with smile!
    const baseSize = Math.max(36, faceWidth * (0.24 + smileScore * 0.12));

    ctx.save();
    ctx.translate(crown.x, crown.y);
    ctx.rotate(roll);

    const arcRadius = faceWidth * 0.66;
    const startAngle = -Math.PI * 0.78;
    const endAngle = -Math.PI * 0.22;

    // Vine arch
    ctx.save();
    ctx.beginPath();
    for (let step = 0; step <= 24; step++) {
      const frac = step / 24;
      const ang = startAngle + (endAngle - startAngle) * frac;
      const px = Math.cos(ang) * arcRadius;
      const py = Math.sin(ang) * arcRadius * 0.55 + arcRadius * 0.45;
      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#3e6b48';
    ctx.lineWidth = 4;
    ctx.stroke();

    for (let l = 0; l < 10; l++) {
      const frac = (l + 0.5) / 10;
      const ang = startAngle + (endAngle - startAngle) * frac;
      const lx = Math.cos(ang) * arcRadius;
      const ly = Math.sin(ang) * arcRadius * 0.55 + arcRadius * 0.45;
      this.drawLeaf(ctx, lx, ly, 18 + bloom * 8, ang + Math.PI / 2);
    }
    ctx.restore();

    // Flowers along crown
    const crownPattern = ['rose', 'sunflower', 'lily', 'sunflower', 'rose'];
    const count = crownPattern.length;

    for (let i = 0; i < count; i++) {
      const frac = i / (count - 1);
      const ang = startAngle + (endAngle - startAngle) * frac;
      const fx = Math.cos(ang) * arcRadius;
      const fy = Math.sin(ang) * arcRadius * 0.55 + arcRadius * 0.45;

      const distFromCenter = Math.abs(frac - 0.5) * 2;
      const flowerSize = baseSize * (1.25 - distFromCenter * 0.22);
      const flowerAngle = ang + Math.PI / 2 + Math.sin(this.time * 2 + i) * 0.08;
      const flowerBloom = Math.min(1.0, bloom * (1.0 - distFromCenter * 0.1));

      this.drawFlower(ctx, crownPattern[i], fx, fy, flowerSize, flowerAngle, flowerBloom);
    }

    ctx.restore();
  }

  drawLeaf(ctx, x, y, length, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-length * 0.25, length * 0.45, 0, length);
    ctx.quadraticCurveTo(length * 0.25, length * 0.45, 0, 0);
    const leafGrad = ctx.createLinearGradient(0, 0, 0, length);
    leafGrad.addColorStop(0, '#588b59');
    leafGrad.addColorStop(1, '#2f5934');
    ctx.fillStyle = leafGrad;
    ctx.fill();
    ctx.restore();
  }

  /**
   * 💫 ORBITING HALO FLOWERS
   * Circle Vriti with depth shading and scale up into BIG flowers when smiling!
   */
  drawOrbitingHalo(ctx, width, height, face, bloom, smileScore) {
    const cx = face ? face.center.x : width * 0.5;
    const cy = face ? face.center.y : height * 0.45;
    const baseRadius = face ? face.faceWidth * (1.5 + smileScore * 0.3) : Math.min(width, height) * 0.38;
    const speedMult = 1.0 + smileScore * 1.5;

    for (let i = 0; i < this.orbitingFlowers.length; i++) {
      const f = this.orbitingFlowers[i];
      const curAngle = f.baseAngle + this.time * f.speed * speedMult;

      const orbitX = cx + Math.cos(curAngle) * (baseRadius * f.radiusX);
      const wobble = Math.sin(this.time * f.wobbleSpeed + i) * f.wobbleAmp;
      const orbitY = cy + Math.sin(curAngle) * (baseRadius * f.radiusY) * 0.48 + wobble;

      const z = Math.sin(curAngle);
      const scale = 0.75 + (z + 1) * 0.25;
      const alpha = 0.6 + (z + 1) * 0.25;

      // When smiling, orbiting flowers grow substantially BIGGER!
      const flowerSize = f.baseSize * scale * (0.85 + smileScore * 0.7);
      const rot = curAngle + this.time * f.rotationSpeed;

      ctx.save();
      ctx.globalAlpha = alpha;
      this.drawFlower(ctx, f.type, orbitX, orbitY, flowerSize, rot, bloom, z * 0.35);
      ctx.restore();
    }
  }

  /**
   * 🌺 BIG FLOWERS COVERING ALL SPACES AROUND DEVI JII WHEN SMILING!
   * Fills the entire perimeter: Full Bottom Bed, Left Climbing Column,
   * Right Climbing Column, and Top Floral Arch Canopy!
   */
  drawAllSurroundingFlowers(ctx, width, height, bloom, smileScore) {
    // Base flower size scales up drastically with smile:
    // When neutral (~35px), when smiling (~70px - 95px HUGE flowers!)
    const minDim = Math.min(width, height);
    const bigSize = Math.max(38, minDim * (0.09 + smileScore * 0.08));

    // =========================================================================
    // 1. BOTTOM FLORAL CARPET (Full width dense bed of big flowers)
    // =========================================================================
    const bottomCount = Math.max(6, Math.floor(width / (bigSize * 1.3)));
    const flowerCycle = ['lily', 'rose', 'sunflower', 'rose', 'lily', 'sunflower'];

    for (let i = 0; i <= bottomCount; i++) {
      const frac = i / bottomCount;
      const x = frac * width;
      // Stagger vertical height for natural botanical depth
      const yOffset = Math.sin(frac * Math.PI * 3 + this.time * 1.5) * 12;
      // The flowers rise up into the frame as she smiles!
      const y = height - (bigSize * 0.5 + smileScore * (bigSize * 0.45)) + yOffset;
      const fType = flowerCycle[i % flowerCycle.length];
      const flowerAngle = Math.sin(this.time + i) * 0.15;
      const flowerScale = bigSize * (0.95 + (i % 2 === 0 ? 0.25 : 0) * (0.6 + smileScore * 0.4));

      // Leaves behind
      this.drawLeaf(ctx, x, y + 10, flowerScale * 1.2, -Math.PI * 0.4);
      this.drawLeaf(ctx, x, y + 10, flowerScale * 1.2, Math.PI * 0.4);

      // Flower
      this.drawFlower(ctx, fType, x, y, flowerScale, flowerAngle, bloom);
    }

    // Extra foreground blooming layer along bottom when smiling big (> 0.25)
    if (smileScore > 0.25) {
      const extraCount = Math.floor(bottomCount * 0.7);
      for (let j = 0; j < extraCount; j++) {
        const frac = (j + 0.5) / extraCount;
        const x = frac * width;
        const y = height - 15 + Math.sin(this.time * 2 + j) * 8;
        const fType = flowerCycle[(j + 2) % flowerCycle.length];
        const extraSize = bigSize * (0.8 + smileScore * 0.35);
        this.drawFlower(ctx, fType, x, y, extraSize, 0.1, bloom);
      }
    }

    // =========================================================================
    // 2. LEFT FLANK (Climbing column of big flowers from bottom to top)
    // =========================================================================
    const sideCount = Math.max(4, Math.floor(height / (bigSize * 2.2)));
    for (let s = 1; s <= sideCount; s++) {
      const frac = s / (sideCount + 1);
      const y = height * (1 - frac);
      // Flowers advance inwards towards the person as she smiles!
      const x = 25 + smileScore * 30 + Math.sin(this.time * 1.2 + s) * 10;
      const fType = flowerCycle[(s * 2) % flowerCycle.length];
      const sSize = bigSize * (0.85 + (s % 2 === 0 ? 0.2 : 0) * (0.5 + smileScore * 0.5));

      // Lush emerald vine stem connecting the column
      ctx.beginPath();
      ctx.moveTo(x - 10, y + 50);
      ctx.quadraticCurveTo(x + 15, y, x - 10, y - 50);
      ctx.strokeStyle = '#3e6b48';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      this.drawLeaf(ctx, x + 15, y, sSize * 0.9, 0.4);
      this.drawFlower(ctx, fType, x, y, sSize, 0.2 + Math.sin(this.time + s) * 0.1, bloom);
    }

    // =========================================================================
    // 3. RIGHT FLANK (Climbing column of big flowers from bottom to top)
    // =========================================================================
    for (let s = 1; s <= sideCount; s++) {
      const frac = s / (sideCount + 1);
      const y = height * (1 - frac);
      const x = width - (25 + smileScore * 30 + Math.sin(this.time * 1.2 + s + 1) * 10);
      const fType = flowerCycle[(s * 2 + 1) % flowerCycle.length];
      const sSize = bigSize * (0.85 + (s % 2 === 1 ? 0.2 : 0) * (0.5 + smileScore * 0.5));

      // Vine stem
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 50);
      ctx.quadraticCurveTo(x - 15, y, x + 10, y - 50);
      ctx.strokeStyle = '#3e6b48';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      this.drawLeaf(ctx, x - 15, y, sSize * 0.9, -0.4);
      this.drawFlower(ctx, fType, x, y, sSize, -0.2 - Math.sin(this.time + s) * 0.1, bloom);
    }

    // =========================================================================
    // 4. TOP FLORAL CANOPY ARCH (Hanging big blooms framing above her)
    // =========================================================================
    // As smile increases, the top canopy blooms open and drapes down over the top!
    if (smileScore > 0.18) {
      const topCount = Math.max(5, Math.floor(width / (bigSize * 1.8)));
      for (let t = 0; t <= topCount; t++) {
        const frac = t / topCount;
        const x = frac * width;
        // Natural curved arch across the top (lower on edges, higher in center)
        const arch = Math.sin(frac * Math.PI) * (bigSize * 0.35);
        const y = 20 + arch + smileScore * 18 + Math.sin(this.time * 1.5 + t) * 6;
        const fType = flowerCycle[(t + 3) % flowerCycle.length];
        const tSize = bigSize * (0.8 + smileScore * 0.3);

        this.drawLeaf(ctx, x, y - 10, tSize * 0.8, Math.PI * 0.5);
        this.drawFlower(ctx, fType, x, y, tSize, Math.PI + Math.sin(this.time + t) * 0.15, bloom);
      }
    }
  }

  /**
   * 🍃 FALLING PETALS
   */
  updateAndDrawPetals(ctx, width, height, smileScore, dt) {
    const targetCount = Math.floor(14 + smileScore * (this.maxPetals - 14));
    const petalTypes = ['rose', 'sunflower', 'lily'];

    while (this.petals.length < targetCount) {
      this.petals.push({
        type: petalTypes[Math.floor(Math.random() * petalTypes.length)],
        x: Math.random() * width,
        y: -30 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 45,
        vy: 35 + Math.random() * 45 + smileScore * 35,
        length: 22 + Math.random() * 20,
        width: 11 + Math.random() * 9,
        pitch: Math.random() * Math.PI * 2,
        pitchSpeed: 1.5 + Math.random() * 2,
        yaw: Math.random() * Math.PI * 2,
        yawSpeed: 1.0 + Math.random() * 1.5,
        roll: Math.random() * Math.PI * 2,
        rollSpeed: (Math.random() - 0.5) * 2,
        opacity: 0.7 + Math.random() * 0.3
      });
    }

    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      p.x += p.vx * dt + Math.sin(this.time * 1.5 + i) * 25 * dt;
      p.y += p.vy * dt;
      p.pitch += p.pitchSpeed * dt;
      p.yaw += p.yawSpeed * dt;
      p.roll += p.rollSpeed * dt;

      if (p.y > height + 40 || p.x < -50 || p.x > width + 50) {
        p.x = Math.random() * width;
        p.y = -30;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.roll);
      ctx.scale(Math.cos(p.yaw), Math.cos(p.pitch));
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      ctx.moveTo(0, -p.length * 0.5);
      ctx.bezierCurveTo(
        -p.width, -p.length * 0.1,
        -p.width * 0.8, p.length * 0.35,
        0, p.length * 0.5
      );
      ctx.bezierCurveTo(
        p.width * 0.8, p.length * 0.35,
        p.width, -p.length * 0.1,
        0, -p.length * 0.5
      );

      const pGrad = ctx.createLinearGradient(0, -p.length * 0.5, 0, p.length * 0.5);
      if (p.type === 'rose') {
        pGrad.addColorStop(0, '#ff4d79');
        pGrad.addColorStop(0.5, '#e60049');
        pGrad.addColorStop(1, '#990033');
      } else if (p.type === 'sunflower') {
        pGrad.addColorStop(0, '#fef08a');
        pGrad.addColorStop(0.5, '#fbbf24');
        pGrad.addColorStop(1, '#d97706');
      } else {
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.5, '#ff8fab');
        pGrad.addColorStop(1, '#d6226c');
      }

      ctx.fillStyle = pGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 4;
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * ✨ ROMANTIC HEARTS & GOLDEN SPARKLES
   */
  updateAndDrawSparkles(ctx, width, height, face, smileScore, dt) {
    if (smileScore > 0.22) {
      const spawnChance = smileScore * 0.7;
      if (Math.random() < spawnChance && this.sparkles.length < this.maxSparkles) {
        const originX = face ? (face.center.x + (Math.random() - 0.5) * face.faceWidth * 1.5) : (width * 0.2 + Math.random() * width * 0.6);
        const originY = face ? (face.center.y + (Math.random() - 0.5) * face.faceWidth * 1.5) : (height * 0.3 + Math.random() * height * 0.4);

        const isHeart = Math.random() < 0.45;
        this.sparkles.push({
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 65,
          vy: -35 - Math.random() * 65,
          size: isHeart ? (12 + Math.random() * 12) : (4 + Math.random() * 6),
          life: 1.0,
          decay: 0.4 + Math.random() * 0.45,
          isHeart,
          rot: (Math.random() - 0.5) * 0.8,
          color: isHeart ? '#ff3366' : (Math.random() > 0.5 ? '#ffd700' : '#ffffff')
        });
      }
    }

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= s.decay * dt;

      if (s.life <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.translate(s.x, s.y);

      if (s.isHeart) {
        this.drawHeart(ctx, s.size, s.color, s.rot);
      } else {
        this.drawTwinkleStar(ctx, s.size, s.color);
      }
      ctx.restore();
    }
  }

  drawHeart(ctx, size, color, rot = 0) {
    ctx.save();
    ctx.rotate(rot);
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-12, -14, -22, 2, 0, 18);
    ctx.bezierCurveTo(22, 2, 12, -14, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  drawTwinkleStar(ctx, size, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let p = 0; p < 8; p++) {
      const radius = p % 2 === 0 ? size : size * 0.28;
      const angle = (p * Math.PI) / 4;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      if (p === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
  }
}
