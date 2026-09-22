/**
 * TERRA-SOL // SMART HOME APPLIANCES CONTROLLER
 * Real-world smartly controlled home appliances: Fan, AC, Heater, Television, Lights, Refrigerator, Washer, Robot Vacuum.
 * Dynamically recalculates cumulative live power load (kW).
 */

import { sfx } from './sound-effects.js';

class ApplianceManager {
  constructor() {
    this.appliances = {
      ac: {
        id: 'ac',
        name: 'Smart Inverter AC',
        active: true,
        basePower: 1.6, // kW
        temp: 22.0,
        mode: 'cool', // cool, eco, dry, turbo
        fanSpeed: 'med' // low, med, high
      },
      fan: {
        id: 'fan',
        name: 'Smart Ceiling Fan',
        active: true,
        basePower: 0.06, // kW
        speed: 3, // 1 to 5
        mode: 'breeze', // breeze, natural, sleep
        oscillate: true
      },
      heater: {
        id: 'heater',
        name: 'Smart Room Heater',
        active: false,
        basePower: 1.8, // kW
        temp: 24.0,
        level: 'standard' // eco, standard, max
      },
      tv: {
        id: 'tv',
        name: 'Smart OLED 4K Television',
        active: true,
        basePower: 0.18, // kW
        volume: 28,
        input: 'stream' // stream, hdmi1, console
      },
      lights: {
        id: 'lights',
        name: 'Smart Ambient Lighting',
        active: true,
        basePower: 0.08, // kW
        brightness: 80,
        tempK: 'warm', // warm (2700K), soft (3000K), daylight (4000K), amber, sage
        colorHex: '#d48806'
      },
      fridge: {
        id: 'fridge',
        name: 'Smart Refrigerator Hub',
        active: true,
        basePower: 0.28, // kW
        temp: 4.0, // °C
        mode: 'eco' // eco, super, holiday
      },
      washer: {
        id: 'washer',
        name: 'Smart Washing Machine',
        active: false,
        basePower: 1.4, // kW
        cycle: 'eco' // eco, cottons, express, spin
      },
      vacuum: {
        id: 'vacuum',
        name: 'Smart Robotic Vacuum',
        active: true,
        basePower: 0.05, // kW
        directive: 'patrol', // patrol, edge, dock
        battery: 92
      }
    };

    this.onPowerChangeCallbacks = [];
  }

  onPowerChange(callback) {
    this.onPowerChangeCallbacks.push(callback);
  }

  notifyPowerChange() {
    const totalPower = this.getTotalPowerDraw();
    this.onPowerChangeCallbacks.forEach(cb => cb(totalPower));
  }

  toggleAppliance(id) {
    if (!this.appliances[id]) return;
    this.appliances[id].active = !this.appliances[id].active;
    sfx.playToggle(this.appliances[id].active);
    this.notifyPowerChange();
    return this.appliances[id].active;
  }

  // 1. AC Controls
  setAcTemp(temp) {
    this.appliances.ac.temp = parseFloat(temp);
    // Colder cooling requires more compressor power
    const diff = Math.max(0, 26.0 - this.appliances.ac.temp);
    let modeMultiplier = 1.0;
    if (this.appliances.ac.mode === 'turbo') modeMultiplier = 1.6;
    else if (this.appliances.ac.mode === 'eco') modeMultiplier = 0.75;
    this.appliances.ac.basePower = parseFloat(((1.1 + diff * 0.12) * modeMultiplier).toFixed(2));
    this.notifyPowerChange();
  }

  setAcMode(mode) {
    this.appliances.ac.mode = mode;
    this.setAcTemp(this.appliances.ac.temp);
    sfx.playClick();
  }

  // 2. Fan Controls
  setFanSpeed(speed) {
    const spd = parseInt(speed, 10);
    this.appliances.fan.speed = spd;
    this.appliances.fan.basePower = parseFloat((0.02 + spd * 0.018).toFixed(3));
    sfx.playClick();
    this.notifyPowerChange();
  }

  setFanMode(mode) {
    this.appliances.fan.mode = mode;
    sfx.playClick();
  }

  // 3. Heater Controls
  setHeaterTemp(temp) {
    this.appliances.heater.temp = parseFloat(temp);
    let mult = 1.0;
    if (this.appliances.heater.level === 'max') mult = 1.5;
    else if (this.appliances.heater.level === 'eco') mult = 0.65;
    const diff = Math.max(0, this.appliances.heater.temp - 18.0);
    this.appliances.heater.basePower = parseFloat(((1.2 + diff * 0.1) * mult).toFixed(2));
    this.notifyPowerChange();
  }

  setHeaterLevel(level) {
    this.appliances.heater.level = level;
    this.setHeaterTemp(this.appliances.heater.temp);
    sfx.playClick();
  }

  // 4. Television Controls
  setTvVolume(vol) {
    this.appliances.tv.volume = parseInt(vol, 10);
    this.appliances.tv.basePower = parseFloat((0.12 + (this.appliances.tv.volume / 100) * 0.12).toFixed(2));
    this.notifyPowerChange();
  }

  setTvInput(input) {
    this.appliances.tv.input = input;
    sfx.playClick();
  }

  // 5. Lighting Controls
  setLightingBrightness(brightness) {
    const b = parseInt(brightness, 10);
    this.appliances.lights.brightness = b;
    this.appliances.lights.basePower = parseFloat((0.01 + (b / 100) * 0.09).toFixed(3));
    this.notifyPowerChange();
  }

  setLightingTone(tone, colorHex) {
    this.appliances.lights.tempK = tone;
    this.appliances.lights.colorHex = colorHex;
    sfx.playClick();
  }

  // 6. Refrigerator Controls
  setFridgeMode(mode) {
    this.appliances.fridge.mode = mode;
    if (mode === 'super') this.appliances.fridge.basePower = 0.48;
    else if (mode === 'holiday') this.appliances.fridge.basePower = 0.14;
    else this.appliances.fridge.basePower = 0.28;
    sfx.playClick();
    this.notifyPowerChange();
  }

  // 7. Washing Machine Controls
  setWasherCycle(cycle) {
    this.appliances.washer.cycle = cycle;
    if (cycle === 'cottons') this.appliances.washer.basePower = 1.8;
    else if (cycle === 'spin') this.appliances.washer.basePower = 2.1;
    else if (cycle === 'express') this.appliances.washer.basePower = 1.2;
    else this.appliances.washer.basePower = 0.9;
    sfx.playClick();
    this.notifyPowerChange();
  }

  // 8. Robot Vacuum Controls
  setVacuumDirective(directive) {
    this.appliances.vacuum.directive = directive;
    this.appliances.vacuum.basePower = directive === 'dock' ? 0.015 : 0.065;
    sfx.playClick();
    this.notifyPowerChange();
  }

  // Total Live Power Draw in kW
  getTotalPowerDraw() {
    let total = 0;
    Object.values(this.appliances).forEach(app => {
      if (app.active) {
        total += app.basePower;
      }
    });
    return parseFloat(total.toFixed(2));
  }

  getActiveCount() {
    return Object.values(this.appliances).filter(a => a.active).length;
  }

  // Presets updated for real-world smart home appliances
  applyPreset(presetName) {
    sfx.playWarp();
    switch (presetName) {
      case 'eco':
        // Eco Conservation: AC 25°C Eco, Fan Speed 1, Heater Off, Lights 30%, TV Off, Washer Off, Vacuum Docked
        this.appliances.ac.active = true;
        this.appliances.ac.temp = 25.0;
        this.appliances.ac.mode = 'eco';
        this.appliances.ac.basePower = 0.9;

        this.appliances.fan.active = true;
        this.appliances.fan.speed = 1;
        this.appliances.fan.basePower = 0.03;

        this.appliances.heater.active = false;
        this.appliances.tv.active = false;

        this.appliances.lights.active = true;
        this.appliances.lights.brightness = 30;
        this.appliances.lights.basePower = 0.035;

        this.appliances.fridge.active = true;
        this.appliances.fridge.mode = 'eco';
        this.appliances.fridge.basePower = 0.22;

        this.appliances.washer.active = false;
        this.appliances.vacuum.active = true;
        this.appliances.vacuum.directive = 'dock';
        this.appliances.vacuum.basePower = 0.015;
        break;

      case 'overdrive':
        // High-Performance / Party: AC Turbo, Fan Speed 5, Lights 100%, TV High Volume, Fridge Super, Washer Running
        this.appliances.ac.active = true;
        this.appliances.ac.temp = 19.0;
        this.appliances.ac.mode = 'turbo';
        this.appliances.ac.basePower = 2.4;

        this.appliances.fan.active = true;
        this.appliances.fan.speed = 5;
        this.appliances.fan.basePower = 0.11;

        this.appliances.heater.active = false;

        this.appliances.tv.active = true;
        this.appliances.tv.volume = 75;
        this.appliances.tv.basePower = 0.25;

        this.appliances.lights.active = true;
        this.appliances.lights.brightness = 100;
        this.appliances.lights.basePower = 0.09;

        this.appliances.fridge.active = true;
        this.appliances.fridge.mode = 'super';
        this.appliances.fridge.basePower = 0.48;

        this.appliances.washer.active = true;
        this.appliances.washer.cycle = 'express';
        this.appliances.washer.basePower = 1.3;

        this.appliances.vacuum.active = true;
        this.appliances.vacuum.directive = 'patrol';
        this.appliances.vacuum.basePower = 0.065;
        break;

      case 'lockdown':
        // Cozy Winter Warmth: Heater Comfort 26°C, AC Off, Fan Off, Warm Lights, TV Stream, Vacuum Docked
        this.appliances.ac.active = false;
        this.appliances.fan.active = false;

        this.appliances.heater.active = true;
        this.appliances.heater.temp = 26.0;
        this.appliances.heater.level = 'standard';
        this.appliances.heater.basePower = 2.1;

        this.appliances.tv.active = true;
        this.appliances.tv.volume = 35;
        this.appliances.tv.basePower = 0.18;

        this.appliances.lights.active = true;
        this.appliances.lights.brightness = 85;
        this.appliances.lights.basePower = 0.08;

        this.appliances.fridge.active = true;
        this.appliances.fridge.mode = 'eco';
        this.appliances.fridge.basePower = 0.28;

        this.appliances.washer.active = false;
        this.appliances.vacuum.active = true;
        this.appliances.vacuum.directive = 'dock';
        this.appliances.vacuum.basePower = 0.015;
        break;

      case 'standard':
      default:
        this.appliances.ac.active = true;
        this.appliances.ac.temp = 22.0;
        this.appliances.ac.mode = 'cool';
        this.appliances.ac.basePower = 1.6;

        this.appliances.fan.active = true;
        this.appliances.fan.speed = 3;
        this.appliances.fan.basePower = 0.06;

        this.appliances.heater.active = false;

        this.appliances.tv.active = true;
        this.appliances.tv.volume = 28;
        this.appliances.tv.basePower = 0.18;

        this.appliances.lights.active = true;
        this.appliances.lights.brightness = 80;
        this.appliances.lights.basePower = 0.08;

        this.appliances.fridge.active = true;
        this.appliances.fridge.mode = 'eco';
        this.appliances.fridge.basePower = 0.28;

        this.appliances.washer.active = false;

        this.appliances.vacuum.active = true;
        this.appliances.vacuum.directive = 'patrol';
        this.appliances.vacuum.basePower = 0.05;
        break;
    }
    this.notifyPowerChange();
  }
}

export const appliances = new ApplianceManager();
