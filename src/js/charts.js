/**
 * TERRA-SOL // NATIVE CANVASES & ANALOG-DIGITAL HYBRID GAUGES
 * Calibrated for crisp contrast on light ivory/cream and white backdrops.
 */

// Draw Analog-Digital Circular Arc Gauge
export function renderCircularGauge(canvas, value, min, max, strokeColor, glowColor) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = cx - 18;

  ctx.clearRect(0, 0, w, h);

  // Background Outer Track (240 degree arc from 135 deg to 405 deg)
  const startAngle = (135 * Math.PI) / 180;
  const endAngle = (405 * Math.PI) / 180;
  const totalAngle = endAngle - startAngle;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.strokeStyle = '#e6ded3';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw Analog Tick Marks
  const numTicks = 20;
  for (let i = 0; i <= numTicks; i++) {
    const angle = startAngle + (totalAngle * (i / numTicks));
    const innerR = radius - 14;
    const outerR = radius - 7;
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = i % 5 === 0 ? '#4d3124' : '#c9bbae';
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.stroke();
  }

  // Calculate Value Percentage
  const clampedVal = Math.min(Math.max(value, min), max);
  const pct = (clampedVal - min) / (max - min);
  const currentAngle = startAngle + totalAngle * pct;

  // Active Arc
  if (pct > 0.01) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, currentAngle);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.shadowColor = glowColor || strokeColor;
    ctx.shadowBlur = 8;
    ctx.stroke();
  }

  // Pointer Needle Node
  const tipX = cx + Math.cos(currentAngle) * radius;
  const tipY = cy + Math.sin(currentAngle) * radius;
  ctx.beginPath();
  ctx.arc(tipX, tipY, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#331f16';
  ctx.lineWidth = 2;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Draw Real-time Oscillating Load Waveform Chart
export function renderLineChart(canvas, history, color, glowColor, maxLimit = 15) {
  if (!canvas || !history || history.length < 2) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background Grid Lines
  ctx.save();
  ctx.strokeStyle = 'rgba(77, 49, 36, 0.08)';
  ctx.lineWidth = 1;
  const gridRows = 3;
  for (let r = 1; r <= gridRows; r++) {
    const y = (h / (gridRows + 1)) * r;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Step calculations
  const stepX = w / (history.length - 1);
  const points = history.map((val, idx) => {
    const norm = Math.min(Math.max(val, 0), maxLimit) / maxLimit;
    const y = h - norm * (h - 18) - 8;
    return { x: idx * stepX, y };
  });

  // Gradient Area Fill Under Curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2;
    const yc = (points[i].y + points[i - 1].y) / 2;
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();

  const areaGradient = ctx.createLinearGradient(0, 0, 0, h);
  areaGradient.addColorStop(0, 'rgba(212, 136, 6, 0.25)');
  areaGradient.addColorStop(1, 'rgba(244, 237, 226, 0)');
  ctx.fillStyle = areaGradient;
  ctx.fill();

  // Waveform Line Stroke
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2;
    const yc = (points[i].y + points[i - 1].y) / 2;
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = glowColor || color;
  ctx.shadowBlur = 6;
  ctx.stroke();

  // Pulsing Head Dot
  const head = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Draw Animated Hydro-Fluid Tank Wave
export function renderWaterWave(canvas, fillPct, flowRate, leakActive, timeOffset = 0) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  const baseWaterLevel = h - (h * (fillPct / 100));
  const waveHeight = leakActive ? 7 : Math.min(2 + flowRate * 0.35, 5.5);
  const waveSpeed = leakActive ? 0.08 : 0.035;

  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, baseWaterLevel);

  for (let x = 0; x <= w; x += 10) {
    const y = baseWaterLevel + Math.sin(x * 0.025 + timeOffset * waveSpeed) * waveHeight;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(w, h);
  ctx.closePath();

  const waveGrad = ctx.createLinearGradient(0, baseWaterLevel, 0, h);
  if (leakActive) {
    waveGrad.addColorStop(0, 'rgba(196, 84, 49, 0.85)');
    waveGrad.addColorStop(1, 'rgba(120, 45, 25, 0.95)');
    ctx.shadowColor = 'rgba(196, 84, 49, 0.4)';
  } else {
    waveGrad.addColorStop(0, 'rgba(37, 143, 131, 0.75)');
    waveGrad.addColorStop(1, 'rgba(20, 85, 78, 0.9)');
    ctx.shadowColor = 'rgba(37, 143, 131, 0.3)';
  }
  ctx.shadowBlur = 6;
  ctx.fillStyle = waveGrad;
  ctx.fill();

  // Crest line
  ctx.beginPath();
  for (let x = 0; x <= w; x += 10) {
    const y = baseWaterLevel + Math.sin(x * 0.025 + timeOffset * waveSpeed) * waveHeight;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = leakActive ? '#c45431' : '#258f83';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

// Draw Segmented Donut Chart
export function renderDonutChart(canvas, segments) {
  if (!canvas || !segments || segments.length === 0) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const outerR = cx - 12;
  const innerR = cx - 36;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return;

  let startAngle = -Math.PI / 2;

  segments.forEach(seg => {
    const sliceAngle = (seg.value / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle - 0.025);
    ctx.arc(cx, cy, innerR, endAngle - 0.025, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = seg.color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;
    ctx.fill();

    startAngle = endAngle;
  });

  // Center Cutout
  ctx.beginPath();
  ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.fill();

  ctx.restore();
}

// Draw Amber Graphic Equalizer
export function renderEqualizer(canvas, isPlaying, timeOffset = 0) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const bars = 22;
  const barWidth = (w / bars) - 3;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  for (let i = 0; i < bars; i++) {
    let barHeight = 4;
    if (isPlaying) {
      const freq = Math.sin(timeOffset * 0.1 + i * 0.6) * 0.5 + 0.5;
      const noise = Math.cos(timeOffset * 0.05 + i * 1.2) * 0.3 + 0.3;
      barHeight = 4 + (freq * noise) * (h - 8);
    }

    const x = i * (barWidth + 3);
    const y = h - barHeight;

    const grad = ctx.createLinearGradient(0, y, 0, h);
    grad.addColorStop(0, '#d48806');
    grad.addColorStop(1, '#c0734a');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  ctx.restore();
}
