/**
 * HABITAT OMEGA-9 // RESOURCE TELEMETRY SIMULATOR
 * Coordinates Electricity, Water, and Gas consumption with real-time physics and appliance coupling.
 */

import { appliances } from './appliances.js';
import { sfx } from './sound-effects.js';

class TelemetrySimulator {
  constructor() {
    // Electricity
    this.powerHistory = new Array(30).fill(4.2);
    this.baseHabitatPower = 1.2; // Life support, hull stabilization
    this.voltage = 239.4;
    this.frequency = 50.01;
    this.dailyKwh = 24.6;

    // Water
    this.waterFlowRate = 8.4;
    this.dailyWaterLiters = 142.0;
    this.waterTankFill = 82.4;
    this.leakSimulated = false;

    // Gas & Reactor
    this.gasPressure = 4.22;
    this.gasFlowRate = 1.18;
    this.coreTemp = 694;
    this.gasValveOpen = true;
    this.gasBoosterActive = false;

    // Animation frame counter
    this.tickCount = 0;
  }

  // Called on every simulation tick (approx once per second or frame)
  tick() {
    this.tickCount++;

    // 1. Calculate Live Electricity Load dynamically coupled to smart appliances
    const applianceLoad = appliances.getTotalPowerDraw();
    // Micro-jitter for cybernetic realism
    const jitter = (Math.random() - 0.5) * 0.15;
    const totalKw = Math.max(0.8, parseFloat((this.baseHabitatPower + applianceLoad + jitter).toFixed(2)));

    // Update rolling load history
    this.powerHistory.push(totalKw);
    if (this.powerHistory.length > 35) {
      this.powerHistory.shift();
    }

    // Accumulate daily kWh (approx 1 tick = 1 sec, scale slightly)
    this.dailyKwh += (totalKw / 3600) * 8; // Accelerated slightly for visible telemetry
    this.voltage = parseFloat((239.0 + (Math.random() - 0.5) * 1.2).toFixed(1));
    this.frequency = parseFloat((50.0 + (Math.random() - 0.5) * 0.06).toFixed(2));

    // 2. Water Telemetry
    let targetFlow = 4.5;
    if (appliances.appliances.washer && appliances.appliances.washer.active) targetFlow += 6.5; // Washing machine cycle draws water!
    if (appliances.appliances.fridge && appliances.appliances.fridge.active) targetFlow += 0.8; // Ice & filtration
    if (this.leakSimulated) targetFlow += 14.0; // Spikes on leak!

    const flowJitter = (Math.random() - 0.5) * 0.4;
    this.waterFlowRate = Math.max(1.0, parseFloat((targetFlow + flowJitter).toFixed(1)));
    this.dailyWaterLiters += (this.waterFlowRate / 60) * 0.5;

    // 3. Gas & Thermal Telemetry
    let basePressure = this.gasValveOpen ? 4.2 : 0.2;
    if (this.gasBoosterActive) basePressure += 1.8;
    const pressJitter = (Math.random() - 0.5) * 0.08;
    this.gasPressure = Math.max(0, parseFloat((basePressure + pressJitter).toFixed(2)));

    let targetGasFlow = this.gasValveOpen ? 1.0 : 0.0;
    if (appliances.appliances.heater && appliances.appliances.heater.active) {
      targetGasFlow += 0.9; // Gas furnace boiler assistance
    }
    if (this.gasBoosterActive) targetGasFlow += 1.2;
    this.gasFlowRate = parseFloat((targetGasFlow + (Math.random() - 0.5) * 0.05).toFixed(2));

    // Core temperature reacts to gas flow
    const targetTemp = this.gasValveOpen ? 680 + (this.gasFlowRate * 35) : 320;
    this.coreTemp = Math.round(this.coreTemp + (targetTemp - this.coreTemp) * 0.08);

    return {
      electricity: {
        currentKw: totalKw,
        history: this.powerHistory,
        dailyKwh: parseFloat(this.dailyKwh.toFixed(1)),
        voltage: this.voltage,
        frequency: this.frequency,
        isOverloaded: totalKw > 10.0
      },
      water: {
        flowRate: this.waterFlowRate,
        dailyLiters: Math.round(this.dailyWaterLiters),
        tankFill: this.waterTankFill,
        leakActive: this.leakSimulated
      },
      gas: {
        pressure: this.gasPressure,
        flowRate: this.gasFlowRate,
        coreTemp: this.coreTemp,
        valveOpen: this.gasValveOpen,
        boosterActive: this.gasBoosterActive
      }
    };
  }

  toggleLeakSimulation() {
    this.leakSimulated = !this.leakSimulated;
    if (this.leakSimulated) {
      sfx.playAlarm();
    } else {
      sfx.playChime();
    }
    return this.leakSimulated;
  }

  recyclePurge() {
    sfx.playWarp();
    this.dailyWaterLiters = Math.max(0, this.dailyWaterLiters - 20);
  }

  toggleGasValve() {
    this.gasValveOpen = !this.gasValveOpen;
    sfx.playToggle(this.gasValveOpen);
    return this.gasValveOpen;
  }

  toggleGasBooster() {
    this.gasBoosterActive = !this.gasBoosterActive;
    sfx.playToggle(this.gasBoosterActive);
    return this.gasBoosterActive;
  }
}

export const telemetry = new TelemetrySimulator();
