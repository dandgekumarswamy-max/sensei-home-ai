/**
 * TERRA-SOL // PRIVACY-GUARDED FINANCIAL SAFE & EXPENSE TRACKER
 * Features physical combination cipher protection, PIN verification, and dynamic expense tracking.
 */

import { sfx } from './sound-effects.js';

const STORAGE_KEY_PIN = 'terrasol_vault_pin';
const STORAGE_KEY_INCOME = 'terrasol_vault_income';
const STORAGE_KEY_EXPENSES = 'terrasol_vault_expenses';

export const CATEGORY_COLORS = {
  Electricity: '#d48806',
  Water: '#258f83',
  Gas: '#c45431',
  Rations: '#8d5b4c',
  Cyberware: '#331f16',
  Comms: '#c0734a',
  Defense: '#a33b20',
  Other: '#725e54'
};

class VaultManager {
  constructor() {
    this.isLocked = true;
    this.pin = localStorage.getItem(STORAGE_KEY_PIN) || '1337';
    this.monthlyIncome = parseFloat(localStorage.getItem(STORAGE_KEY_INCOME)) || 14850;
    
    // Default initial expenses
    const storedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (storedExpenses) {
      try {
        this.expenses = JSON.parse(storedExpenses);
      } catch (e) {
        this.expenses = this.getDefaultExpenses();
      }
    } else {
      this.expenses = this.getDefaultExpenses();
      this.saveExpenses();
    }

    this.autoLockTimer = null;
    this.autoLockRemaining = 300; // 5 minutes in seconds
    this.onStateChangeCallbacks = [];
  }

  getDefaultExpenses() {
    return [
      { id: '1', title: 'Solar Matrix & Grid Conduit Fee', amount: 1420, category: 'Electricity', date: '2088.260' },
      { id: '2', title: 'Hydro-Water Nanofiltration Batch', amount: 380, category: 'Water', date: '2088.261' },
      { id: '3', title: 'Thermal Gas Reactor Fuel Cells', amount: 650, category: 'Gas', date: '2088.262' },
      { id: '4', title: 'Organic Provisions & Harvest Rations', amount: 1250, category: 'Rations', date: '2088.263' },
      { id: '5', title: 'Precision Hardware & Cyber Deck', amount: 980, category: 'Cyberware', date: '2088.264' },
      { id: '6', title: 'Deep-Space Atelier Comm Uplink', amount: 420, category: 'Comms', date: '2088.265' },
      { id: '7', title: 'Perimeter Barrier Grid Capacitor', amount: 1280, category: 'Defense', date: '2088.265' }
    ];
  }

  saveExpenses() {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(this.expenses));
  }

  onStateChange(callback) {
    this.onStateChangeCallbacks.push(callback);
  }

  notifyStateChange() {
    this.onStateChangeCallbacks.forEach(cb => cb(this.getSummary()));
  }

  // Verify PIN
  authenticate(enteredPin) {
    if (enteredPin === this.pin) {
      this.isLocked = false;
      sfx.playChime();
      this.startAutoLockTimer();
      this.notifyStateChange();
      return true;
    } else {
      sfx.playError();
      return false;
    }
  }

  lock() {
    this.isLocked = true;
    sfx.playClick();
    this.clearAutoLockTimer();
    this.notifyStateChange();
  }

  setPin(newPin) {
    if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
      this.pin = newPin;
      localStorage.setItem(STORAGE_KEY_PIN, newPin);
      sfx.playChime();
      return true;
    }
    sfx.playError();
    return false;
  }

  setIncome(newIncome) {
    const val = parseFloat(newIncome);
    if (!isNaN(val) && val >= 0) {
      this.monthlyIncome = val;
      localStorage.setItem(STORAGE_KEY_INCOME, val.toString());
      sfx.playClick();
      this.notifyStateChange();
      return true;
    }
    return false;
  }

  addExpense(title, amount, category) {
    const num = parseFloat(amount);
    if (!title || isNaN(num) || num <= 0) return false;
    const item = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: num,
      category: category || 'Other',
      date: '2088.265'
    };
    this.expenses.unshift(item);
    this.saveExpenses();
    sfx.playClick();
    this.notifyStateChange();
    return true;
  }

  removeExpense(id) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.saveExpenses();
    sfx.playClick();
    this.notifyStateChange();
  }

  startAutoLockTimer() {
    this.clearAutoLockTimer();
    this.autoLockRemaining = 300;
    this.autoLockTimer = setInterval(() => {
      this.autoLockRemaining--;
      if (this.autoLockRemaining <= 0) {
        this.lock();
      }
    }, 1000);
  }

  clearAutoLockTimer() {
    if (this.autoLockTimer) {
      clearInterval(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  getSummary() {
    const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = this.monthlyIncome - totalExpenses;
    const burnRatePct = this.monthlyIncome > 0 
      ? Math.min((totalExpenses / this.monthlyIncome) * 100, 100).toFixed(1)
      : '100.0';

    // Calculate category distribution
    const categoryTotals = {};
    this.expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryDistribution = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      value: categoryTotals[cat],
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
      percentage: ((categoryTotals[cat] / (totalExpenses || 1)) * 100).toFixed(1)
    }));

    return {
      isLocked: this.isLocked,
      monthlyIncome: this.monthlyIncome,
      totalExpenses,
      netBalance,
      burnRatePct,
      categoryDistribution,
      expensesList: this.expenses,
      autoLockRemaining: this.autoLockRemaining
    };
  }
}

export const vault = new VaultManager();
