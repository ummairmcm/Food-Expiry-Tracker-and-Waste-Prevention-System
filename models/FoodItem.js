// OBJECT-ORIENTED PARADIGM: encapsulation, inheritance, polymorphism.
const { daysBetween, todayStr } = require('../utils/functional');

class FoodItem {
  #expiryDate; // private field (encapsulation)

  constructor({ id, name, category, quantity, unit, expiry_date, added_date, state }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.quantity = quantity;
    this.unit = unit;
    this.#expiryDate = expiry_date;
    this.addedDate = added_date;
    this.state = state || 'active';
  }

  get expiryDate() { return this.#expiryDate; }

  daysLeft(today = todayStr()) { return daysBetween(today, this.#expiryDate); }

  // Polymorphic: subclasses override this
  isPerishable() { return false; }

  storageTip() { return 'Store in a cool, dry place.'; }

  toJSON(today = todayStr()) {
    return {
      id: this.id, name: this.name, category: this.category,
      quantity: this.quantity, unit: this.unit,
      expiryDate: this.#expiryDate, addedDate: this.addedDate,
      state: this.state, daysLeft: this.daysLeft(today),
      perishable: this.isPerishable(), tip: this.storageTip(),
    };
  }

  // Factory: picks the right subclass for a DB row
  static fromRow(row) {
    return Perishable.CATEGORIES.includes(row.category)
      ? new Perishable(row)
      : new Pantry(row);
  }
}

class Perishable extends FoodItem {
  static CATEGORIES = ['dairy', 'vegetable', 'meat', 'fruit', 'seafood'];
  isPerishable() { return true; }
  storageTip() { return 'Keep refrigerated and use quickly.'; }
}

class Pantry extends FoodItem {
  isPerishable() { return false; }
  storageTip() { return 'Keep sealed in a cool, dry cupboard.'; }
}

module.exports = { FoodItem, Perishable, Pantry };
