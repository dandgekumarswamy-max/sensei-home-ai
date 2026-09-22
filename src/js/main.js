/**
 * TERRA-SOL // MAIN CONSOLE CONTROLLER & BOOTSTRAPPER
 * WHITE & BROWN WARM RETRO-FUTURISTIC THEME
 */

import { sfx } from './sound-effects.js';
import { appliances } from './appliances.js';
import { vault } from './vault.js';
import { telemetry } from './telemetry.js';
import { 
  renderCircularGauge, 
  renderLineChart, 
  renderWaterWave, 
  renderDonutChart, 
  renderEqualizer 
} from './charts.js';

// ==========================================================================
// 1. BACKGROUND CANVAS ANIMATION (Warm Mechanical Grid & Sepia Dust)
// ==========================================================================
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  // Warm floating particles
  const numDust = 60;
  const particles = Array.from({ length: numDust }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 1.6 + 0.6,
    alpha: Math.random() * 0.4 + 0.1,
    speed: Math.random() * 0.25 + 0.05
  }));

  function drawBg() {
    ctx.clearRect(0, 0, w, h);

    // Warm cream background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, '#fbf8f2');
    bgGrad.addColorStop(0.7, '#f6f1e7');
    bgGrad.addColorStop(1, '#ece3d5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle warm isometric blueprint grid
    ctx.strokeStyle = 'rgba(77, 49, 36, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Drifting Warm Dust
    particles.forEach(p => {
      p.y -= p.speed;
      if (p.y < 0) p.y = h;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 140, 110, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(drawBg);
  }

  requestAnimationFrame(drawBg);
}

// ==========================================================================
// 2. CONSOLE CLOCK
// ==========================================================================
function updateHudClock() {
  const clockEl = document.getElementById('hud-clock');
  if (!clockEl) return;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `18.10.2088 // ${hours}:${minutes}:${seconds}`;
}

// ==========================================================================
// 3. TELEMETRY RENDER LOOP (60 FPS & 1 SEC TICK)
// ==========================================================================
let lastTickTime = 0;
let animationTime = 0;

function startTelemetryLoop() {
  const gaugePower = document.getElementById('gauge-electricity');
  const chartPower = document.getElementById('chart-electricity');
  const gaugeWater = document.getElementById('gauge-water');
  const canvasWave = document.getElementById('canvas-water-wave');
  const gaugeGas = document.getElementById('gauge-gas');
  const canvasEq = document.getElementById('canvas-equalizer');

  // DOM value elements
  const elPowerKw = document.getElementById('power-kw-display');
  const elPowerDaily = document.getElementById('power-daily-kwh');
  const elPowerVolt = document.getElementById('power-voltage');
  const elPowerFreq = document.getElementById('power-freq');
  const elPowerAlert = document.getElementById('power-overload-alert');

  const elWaterFlow = document.getElementById('water-flow-display');
  const elWaterDaily = document.getElementById('water-daily-liters');
  const elLeakIndicator = document.getElementById('leak-indicator');

  const elGasPressure = document.getElementById('gas-pressure-display');
  const elGasFlow = document.getElementById('gas-flow-rate');
  const elGasTemp = document.getElementById('gas-core-temp');

  const elStripAppliance = document.getElementById('strip-appliance-power');
  const elStripEfficiency = document.getElementById('strip-efficiency');

  function loop(currentTime) {
    animationTime++;

    // 1-second simulation tick
    if (currentTime - lastTickTime > 900) {
      lastTickTime = currentTime;
      const data = telemetry.tick();

      // Electricity Readouts
      if (elPowerKw) elPowerKw.textContent = data.electricity.currentKw.toFixed(2);
      if (elPowerDaily) elPowerDaily.textContent = data.electricity.dailyKwh.toFixed(1);
      if (elPowerVolt) elPowerVolt.textContent = data.electricity.voltage.toFixed(1);
      if (elPowerFreq) elPowerFreq.textContent = data.electricity.frequency.toFixed(2);

      // Overload status
      if (elPowerAlert) {
        if (data.electricity.isOverloaded) {
          elPowerAlert.className = 'card-footer-alert danger';
          elPowerAlert.innerHTML = `<span class="alert-icon">⚠️</span><span class="alert-text">POWER CONDUIT: <strong>HIGH LOAD CAPACITY WARN</strong></span>`;
        } else {
          elPowerAlert.className = 'card-footer-alert';
          elPowerAlert.innerHTML = `<span class="alert-icon">⚡</span><span class="alert-text">POWER CONDUIT: <strong>NOMINAL THERMAL BALANCE</strong></span>`;
        }
      }

      // Water Readouts
      if (elWaterFlow) elWaterFlow.textContent = data.water.flowRate.toFixed(1);
      if (elWaterDaily) elWaterDaily.textContent = data.water.dailyLiters;
      if (elLeakIndicator) {
        if (data.water.leakActive) {
          elLeakIndicator.textContent = 'CONDUIT BREACH DETECTED!';
          elLeakIndicator.className = 'chart-tag text-terracotta';
        } else {
          elLeakIndicator.textContent = 'ALL SEALS INTACT';
          elLeakIndicator.className = 'chart-tag text-teal';
        }
      }

      // Gas Readouts
      if (elGasPressure) elGasPressure.textContent = data.gas.pressure.toFixed(2);
      if (elGasFlow) elGasFlow.textContent = data.gas.flowRate.toFixed(2);
      if (elGasTemp) elGasTemp.textContent = data.gas.coreTemp;

      // Strip Stats
      const applianceTotal = appliances.getTotalPowerDraw();
      if (elStripAppliance) elStripAppliance.textContent = `${applianceTotal} kW`;
      const efficiency = (100 - (applianceTotal * 1.8)).toFixed(1);
      if (elStripEfficiency) elStripEfficiency.textContent = `${Math.max(78.5, efficiency)}%`;

      // Render Gauges & Oscillating Waveform
      renderCircularGauge(gaugePower, data.electricity.currentKw, 0, 16, '#d48806', 'rgba(212, 136, 6, 0.35)');
      renderLineChart(chartPower, data.electricity.history, '#d48806', 'rgba(212, 136, 6, 0.35)', 15);

      renderCircularGauge(gaugeWater, data.water.flowRate, 0, 30, '#258f83', 'rgba(37, 143, 131, 0.3)');
      renderCircularGauge(gaugeGas, data.gas.pressure, 0, 8, '#c45431', 'rgba(196, 84, 49, 0.3)');
    }

    // Continuous 60fps wave & equalizer
    renderWaterWave(canvasWave, telemetry.waterTankFill, telemetry.waterFlowRate, telemetry.leakSimulated, animationTime);
    renderEqualizer(canvasEq, appliances.appliances.audio.active, animationTime);

    // Auto-relock countdown if unlocked
    if (!vault.isLocked) {
      const countdownEl = document.getElementById('countdown-val');
      if (countdownEl) {
        const mins = Math.floor(vault.autoLockRemaining / 60);
        const secs = vault.autoLockRemaining % 60;
        countdownEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// ==========================================================================
// 4. FINANCIAL VAULT & EXPENSE LEDGER UI
// ==========================================================================
function updateVaultUI(summary = vault.getSummary()) {
  const curtain = document.getElementById('vault-locked-curtain');
  const unlocked = document.getElementById('vault-unlocked-content');
  const statusShield = document.getElementById('vault-status-indicator');
  const headerVaultBtn = document.getElementById('header-vault-status');

  if (summary.isLocked) {
    curtain?.classList.remove('hidden');
    unlocked?.classList.add('hidden');
    if (statusShield) {
      statusShield.className = 'vault-status-pill locked';
      statusShield.innerHTML = '<span class="lock-icon">🔒</span><span class="lock-label">ENCRYPTED</span>';
    }
    if (headerVaultBtn) {
      headerVaultBtn.textContent = 'LOCKED';
      headerVaultBtn.style.color = '#c45431';
    }
  } else {
    curtain?.classList.add('hidden');
    unlocked?.classList.remove('hidden');
    if (statusShield) {
      statusShield.className = 'vault-status-pill unlocked';
      statusShield.innerHTML = '<span class="lock-icon">🔓</span><span class="lock-label">AUTHENTICATED</span>';
    }
    if (headerVaultBtn) {
      headerVaultBtn.textContent = 'OPEN';
      headerVaultBtn.style.color = '#258f83';
    }

    // Numerical Metrics
    const elIncome = document.getElementById('val-income');
    const elExpenses = document.getElementById('val-total-expenses');
    const elNet = document.getElementById('val-net-balance');
    const elCount = document.getElementById('val-expense-count');
    const elBurn = document.getElementById('burn-rate-indicator');
    const elSurplusFill = document.getElementById('surplus-bar-fill');

    if (elIncome) elIncome.textContent = summary.monthlyIncome.toLocaleString();
    if (elExpenses) elExpenses.textContent = summary.totalExpenses.toLocaleString();
    if (elNet) {
      const prefix = summary.netBalance >= 0 ? '+' : '';
      elNet.textContent = `${prefix}${summary.netBalance.toLocaleString()}`;
      elNet.className = summary.netBalance >= 0 ? 'metric-value text-teal' : 'metric-value text-terracotta';
    }
    if (elCount) elCount.textContent = `${summary.expensesList.length} Active Deductions`;
    if (elBurn) elBurn.textContent = `BURN RATE: ${summary.burnRatePct}%`;

    if (elSurplusFill) {
      const pct = Math.max(0, Math.min(100, (summary.netBalance / (summary.monthlyIncome || 1)) * 100));
      elSurplusFill.style.width = `${pct}%`;
    }

    // Donut Chart
    const canvasDonut = document.getElementById('chart-expenses-donut');
    renderDonutChart(canvasDonut, summary.categoryDistribution);

    // Donut Legend
    const legendContainer = document.getElementById('donut-legend-container');
    if (legendContainer) {
      legendContainer.innerHTML = summary.categoryDistribution.map(cat => `
        <div class="legend-item">
          <span class="legend-color" style="background:${cat.color};"></span>
          <span>${cat.category}: <strong>${cat.percentage}%</strong></span>
        </div>
      `).join('');
    }

    // Render Expense Items Table
    const listContainer = document.getElementById('expense-items-container');
    if (listContainer) {
      if (summary.expensesList.length === 0) {
        listContainer.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-family:var(--font-mono);">NO ACTIVE EXPENDITURES RECORDED</div>`;
      } else {
        listContainer.innerHTML = summary.expensesList.map(exp => `
          <div class="expense-row" data-id="${exp.id}">
            <span class="exp-title-cell" title="${exp.title}">${exp.title}</span>
            <span class="exp-cat-cell">
              <span class="category-badge" style="background:#f4ede2;border:1px solid ${getWarmCategoryColor(exp.category)};color:${getWarmCategoryColor(exp.category)}">
                ${exp.category}
              </span>
            </span>
            <span class="exp-amount-cell">${exp.amount.toLocaleString()} ₢</span>
            <span class="exp-action-cell">
              <button class="btn-del-expense" data-id="${exp.id}" title="Delete Record">✕</button>
            </span>
          </div>
        `).join('');

        // Attach Delete
        listContainer.querySelectorAll('.btn-del-expense').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            vault.removeExpense(id);
          });
        });
      }
    }
  }
}

function getWarmCategoryColor(cat) {
  const map = {
    Electricity: '#d48806',
    Water: '#258f83',
    Gas: '#c45431',
    Rations: '#8d5b4c',
    Cyberware: '#331f16',
    Comms: '#c0734a',
    Defense: '#a33b20',
    Other: '#725e54'
  };
  return map[cat] || '#725e54';
}

// ==========================================================================
// 5. COMBINATION SECURITY PIN MODAL
// ==========================================================================
function initPinModal() {
  const modal = document.getElementById('pin-modal');
  const btnOpen = document.getElementById('btn-open-pin-modal');
  const btnHeaderVault = document.getElementById('btn-privacy-vault');
  const btnClose = document.getElementById('btn-close-modal');
  const errorBanner = document.getElementById('pin-error-msg');
  const slots = document.querySelectorAll('.pin-slot');

  let enteredPin = '';

  function openModal() {
    enteredPin = '';
    updateSlots();
    errorBanner?.classList.add('hidden');
    modal?.classList.remove('hidden');
    sfx.playClick();
  }

  function closeModal() {
    modal?.classList.add('hidden');
    enteredPin = '';
    sfx.playClick();
  }

  function updateSlots() {
    slots.forEach((slot, idx) => {
      if (idx < enteredPin.length) {
        slot.classList.add('filled');
      } else {
        slot.classList.remove('filled');
      }
    });
  }

  function submitPin() {
    if (enteredPin.length === 4) {
      const ok = vault.authenticate(enteredPin);
      if (ok) {
        closeModal();
      } else {
        errorBanner?.classList.remove('hidden');
        enteredPin = '';
        updateSlots();
      }
    }
  }

  btnOpen?.addEventListener('click', openModal);
  btnHeaderVault?.addEventListener('click', () => {
    if (vault.isLocked) openModal();
    else vault.lock();
  });
  btnClose?.addEventListener('click', closeModal);

  // Keypad clicks
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-key');
      sfx.playClick();

      if (key === 'CLEAR') {
        enteredPin = '';
        updateSlots();
        errorBanner?.classList.add('hidden');
      } else if (key === 'ENTER') {
        submitPin();
      } else if (/^\d$/.test(key)) {
        if (enteredPin.length < 4) {
          enteredPin += key;
          updateSlots();
          if (enteredPin.length === 4) {
            setTimeout(submitPin, 180);
          }
        }
      }
    });
  });

  // Physical Keyboard listener
  window.addEventListener('keydown', (e) => {
    if (modal && !modal.classList.contains('hidden')) {
      if (/^\d$/.test(e.key)) {
        if (enteredPin.length < 4) {
          enteredPin += e.key;
          updateSlots();
          sfx.playClick();
          if (enteredPin.length === 4) setTimeout(submitPin, 180);
        }
      } else if (e.key === 'Backspace') {
        enteredPin = enteredPin.slice(0, -1);
        updateSlots();
        sfx.playClick();
      } else if (e.key === 'Enter') {
        submitPin();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    }
  });

  // Relock Button
  document.getElementById('btn-lock-now')?.addEventListener('click', () => {
    vault.lock();
  });

  // Add Expense Drawer Toggle
  const btnToggleAdd = document.getElementById('btn-toggle-add-expense');
  const drawer = document.getElementById('add-expense-drawer');
  const btnCancelExp = document.getElementById('btn-cancel-expense');

  btnToggleAdd?.addEventListener('click', () => {
    drawer?.classList.toggle('hidden');
    sfx.playClick();
  });
  btnCancelExp?.addEventListener('click', () => {
    drawer?.classList.add('hidden');
    sfx.playClick();
  });

  // Expense Form Submit
  const expForm = document.getElementById('form-add-expense');
  expForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('exp-title');
    const amtInput = document.getElementById('exp-amount');
    const catInput = document.getElementById('exp-category');

    if (titleInput && amtInput && catInput) {
      const ok = vault.addExpense(titleInput.value, amtInput.value, catInput.value);
      if (ok) {
        titleInput.value = '';
        amtInput.value = '';
        drawer?.classList.add('hidden');
      }
    }
  });

  // Edit Income
  document.getElementById('btn-edit-income')?.addEventListener('click', () => {
    const current = vault.monthlyIncome;
    const input = prompt('Enter Updated Atelier Monthly Income (Credits ₢):', current);
    if (input !== null) {
      vault.setIncome(input);
    }
  });

  // Change PIN Modal
  const changePinModal = document.getElementById('change-pin-modal');
  document.getElementById('btn-change-pin')?.addEventListener('click', () => {
    changePinModal?.classList.remove('hidden');
    sfx.playClick();
  });
  document.getElementById('btn-close-pin-change')?.addEventListener('click', () => {
    changePinModal?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-pin-change')?.addEventListener('click', () => {
    changePinModal?.classList.add('hidden');
  });
  document.getElementById('form-change-pin')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPinInput = document.getElementById('input-new-pin');
    if (newPinInput) {
      const ok = vault.setPin(newPinInput.value);
      if (ok) {
        alert('Master Combination Cipher updated successfully.');
        changePinModal?.classList.add('hidden');
        newPinInput.value = '';
      } else {
        alert('Invalid Combination format. Must be exactly 4 numeric digits.');
      }
    }
  });
}

// ==========================================================================
// 6. SMART APPLIANCES UI BINDINGS
// ==========================================================================
function initApplianceControls() {
  const elActiveCount = document.getElementById('active-appliances-count');

  function updateApplianceUI() {
    Object.values(appliances.appliances).forEach(app => {
      const card = document.getElementById(`appliance-${app.id}`);
      const btn = card?.querySelector('.appliance-power-btn');
      const drawEl = document.getElementById(`draw-${app.id}`);

      if (card) {
        if (app.active) card.classList.add('active');
        else card.classList.remove('active');
      }
      if (btn) {
        if (app.active) btn.classList.add('active');
        else btn.classList.remove('active');
      }
      if (drawEl) {
        drawEl.textContent = app.active ? app.basePower.toFixed(2) : '0.0';
      }
    });

    if (elActiveCount) {
      elActiveCount.textContent = `${appliances.getActiveCount()} / 8`;
    }
  }

  // Generic Power Toggle Buttons
  document.querySelectorAll('.appliance-power-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-appliance');
      appliances.toggleAppliance(id);
      updateApplianceUI();
    });
  });

  // 1. AC Controls
  const acSlider = document.getElementById('ac-temp-slider');
  const acVal = document.getElementById('ac-temp-val');
  acSlider?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (acVal) acVal.textContent = `${val}°C`;
    appliances.setAcTemp(val);
    updateApplianceUI();
  });

  document.querySelectorAll('[data-ac-mode]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-ac-mode]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const mode = e.currentTarget.getAttribute('data-ac-mode');
      appliances.setAcMode(mode);
      updateApplianceUI();
    });
  });

  // 2. Ceiling Fan Controls
  const fanSlider = document.getElementById('fan-speed-slider');
  const fanVal = document.getElementById('fan-speed-val');
  fanSlider?.addEventListener('input', (e) => {
    const spd = e.target.value;
    if (fanVal) fanVal.textContent = `SPEED ${spd}`;
    appliances.setFanSpeed(spd);
    updateApplianceUI();
  });

  document.querySelectorAll('[data-fan-mode]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-fan-mode]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const mode = e.currentTarget.getAttribute('data-fan-mode');
      appliances.setFanMode(mode);
      updateApplianceUI();
    });
  });

  // 3. Room Heater Controls
  const heaterSlider = document.getElementById('heater-temp-slider');
  const heaterVal = document.getElementById('heater-temp-val');
  heaterSlider?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (heaterVal) heaterVal.textContent = `${val}°C`;
    appliances.setHeaterTemp(val);
    updateApplianceUI();
  });

  document.querySelectorAll('[data-heater-level]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-heater-level]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const lvl = e.currentTarget.getAttribute('data-heater-level');
      appliances.setHeaterLevel(lvl);
      updateApplianceUI();
    });
  });

  // 4. Television Controls
  const tvVolSlider = document.getElementById('tv-volume-slider');
  const tvVolVal = document.getElementById('tv-volume-val');
  tvVolSlider?.addEventListener('input', (e) => {
    const vol = e.target.value;
    if (tvVolVal) tvVolVal.textContent = `${vol}%`;
    appliances.setTvVolume(vol);
    updateApplianceUI();
  });

  document.querySelectorAll('[data-tv-input]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-tv-input]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const input = e.currentTarget.getAttribute('data-tv-input');
      appliances.setTvInput(input);
      updateApplianceUI();
    });
  });

  // 5. Lighting Controls
  const lightSlider = document.getElementById('lights-brightness-slider');
  const lightVal = document.getElementById('lights-brightness-val');
  lightSlider?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (lightVal) lightVal.textContent = `${val}%`;
    appliances.setLightingBrightness(val);
    updateApplianceUI();
  });

  document.querySelectorAll('.color-dot[data-tone]').forEach(dot => {
    dot.addEventListener('click', (e) => {
      document.querySelectorAll('.color-dot[data-tone]').forEach(d => d.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const tone = e.currentTarget.getAttribute('data-tone');
      const hex = e.currentTarget.getAttribute('data-hex');
      appliances.setLightingTone(tone, hex);
    });
  });

  // 6. Refrigerator Controls
  document.querySelectorAll('[data-fridge-mode]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-fridge-mode]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const mode = e.currentTarget.getAttribute('data-fridge-mode');
      appliances.setFridgeMode(mode);
      updateApplianceUI();
    });
  });

  // 7. Washing Machine Controls
  document.querySelectorAll('[data-washer-cycle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-washer-cycle]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const cycle = e.currentTarget.getAttribute('data-washer-cycle');
      appliances.setWasherCycle(cycle);
      updateApplianceUI();
    });
  });

  // 8. Robotic Vacuum Controls
  document.querySelectorAll('[data-vacuum-directive]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-vacuum-directive]').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const directive = e.currentTarget.getAttribute('data-vacuum-directive');
      appliances.setVacuumDirective(directive);
      updateApplianceUI();
    });
  });

  // Operating Presets Strip
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const preset = e.currentTarget.getAttribute('data-preset');
      appliances.applyPreset(preset);
      updateApplianceUI();
    });
  });

  // Initial Sync
  appliances.onPowerChange(() => {
    updateApplianceUI();
  });
}

// ==========================================================================
// 7. UTILITY CONDUIT ACTIONS
// ==========================================================================
function initUtilityActions() {
  // Simulate Leak
  const btnLeak = document.getElementById('btn-simulate-leak');
  btnLeak?.addEventListener('click', () => {
    const isLeak = telemetry.toggleLeakSimulation();
    if (isLeak) {
      btnLeak.innerHTML = '<span>🛑</span> SEAL CONDUIT BREACH';
      btnLeak.style.borderColor = '#c45431';
      btnLeak.style.color = '#c45431';
    } else {
      btnLeak.innerHTML = '<span>⚠️</span> SIMULATE CONDUIT LEAK';
      btnLeak.style.borderColor = '';
      btnLeak.style.color = '';
    }
  });

  // Recycle Purge
  document.getElementById('btn-flush-water')?.addEventListener('click', () => {
    telemetry.recyclePurge();
  });

  // Gas Solenoid Valve
  const btnGasValve = document.getElementById('btn-gas-valve');
  btnGasValve?.addEventListener('click', () => {
    const isOpen = telemetry.toggleGasValve();
    if (isOpen) {
      btnGasValve.classList.add('active');
      btnGasValve.querySelector('.rocker-text').textContent = 'OPEN';
    } else {
      btnGasValve.classList.remove('active');
      btnGasValve.querySelector('.rocker-text').textContent = 'CLOSED';
    }
  });

  // Gas Booster
  const btnGasBooster = document.getElementById('btn-gas-booster');
  btnGasBooster?.addEventListener('click', () => {
    const isActive = telemetry.toggleGasBooster();
    if (isActive) {
      btnGasBooster.classList.add('active');
      btnGasBooster.querySelector('.rocker-text').textContent = 'ENGAGED';
    } else {
      btnGasBooster.classList.remove('active');
      btnGasBooster.querySelector('.rocker-text').textContent = 'STANDBY';
    }
  });

  // Texture Grid Toggle
  const btnScanlines = document.getElementById('btn-toggle-scanlines');
  const scanlinesOverlay = document.getElementById('crt-overlay');
  const scanlinesStatus = document.getElementById('scanlines-status');
  btnScanlines?.addEventListener('click', () => {
    sfx.playClick();
    scanlinesOverlay?.classList.toggle('active');
    const isActive = scanlinesOverlay?.classList.contains('active');
    btnScanlines.classList.toggle('active', isActive);
    if (scanlinesStatus) scanlinesStatus.textContent = isActive ? 'ON' : 'OFF';
  });

  // Solenoid SFX Toggle
  const btnSfx = document.getElementById('btn-toggle-sfx');
  const sfxStatus = document.getElementById('sfx-status');
  btnSfx?.addEventListener('click', () => {
    const isEnabled = sfx.toggle();
    btnSfx.classList.toggle('active', isEnabled);
    if (sfxStatus) sfxStatus.textContent = isEnabled ? 'ON' : 'MUTED';
  });
}

// ==========================================================================
// 8. BOOTSTRAP
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  setInterval(updateHudClock, 1000);
  updateHudClock();

  vault.onStateChange(updateVaultUI);
  updateVaultUI();

  initPinModal();
  initApplianceControls();
  initUtilityActions();

  startTelemetryLoop();
});
