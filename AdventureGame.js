// ===========================================
// The Dragon's Quest - Text Adventure Game
// A progression-based learning project
// ===========================================

// Include readline for player input
const readline = require("readline-sync");

// Game state variables
let gameRunning = true;
let playerName = "";
let playerHealth = 100;
let playerGold = 20; // Starting gold
let currentLocation = "village";

// Weapon damage (starts at 0 until player buys a sword)
// let weaponDamage = 0; // Base weapon damage
// let healingPotionValue = 30; // How much health is restored

// Item templates with properties
const healthPotion = {
  name: "Health Potion",
  type: "potion",
  value: 5, // Cost in gold
  effect: 30, // Healing amount
  description: "Restores 30 health points",
};

const sword = {
  name: "Basic Sword",
  type: "weapon",
  value: 10, // Cost in gold
  effect: 10, // Damage amount
  description: "A sturdy blade for combat",
};

const shield = {
    name: "Wooden Shield",
    type: "armor",
    value: 8, // gold cost
    effect: 5, // protection amount
    description: "Reduces damage taken in combat",
};

const steelSword = {
    name: "Steel Sword",
    type: "weapon",
    value: 20, // gold cost
    effect: 20, // damage amount
    description: "A stronger steel blade",
};

const ironShield = {
    name: "Iron Shield",
    type: "armor",
    value: 16, // gold cost
    effect: 10, // protection amount
    description: "A stronger iron shield",
};

// Create empty inventory array (from previous lab)
let inventory = []; // Will now store item objects instead of strings

// Create an array of items for sale at the blacksmith
let blacksmithItems = [];
// Add objects to blacksmith items
blacksmithItems.push({ ...sword }); // Create a copy of the sword object
blacksmithItems.push({ ...steelSword });
blacksmithItems.push({ ...shield });
blacksmithItems.push({ ...ironShield });

// ===========================
// Display Functions
// Functions that show game information to the player
// ===========================

/**
 * Shows the player's current stats
 * Displays health, gold, and current location
 */
function showStatus() {
  console.log("\n=== " + playerName + "'s Status ===");
  console.log("❤️  Health: " + playerHealth);
  console.log("💰 Gold: " + playerGold);
  console.log("📍 Location: " + currentLocation);

  // Enhanced inventory display with item details
  console.log("🎒 Inventory: ");
  if (inventory.length === 0) {
    console.log("   Nothing in inventory");
  } else {
    inventory.forEach((item, index) => {
      console.log(
        "   " + (index + 1) + ". " + item.name + " - " + item.description
      );
    });
  }
}

/**
 * Shows the current location's description and available choices
 */
function showLocation() {
  console.log("\n=== " + currentLocation.toUpperCase() + " ===");

  if (currentLocation === "village") {
    console.log(
      "You're in a bustling village. The blacksmith and market are nearby."
    );
    console.log("\nWhat would you like to do?");
    console.log("1: Go to blacksmith");
    console.log("2: Go to market");
    console.log("3: Enter forest");
    console.log("4: Check status");
    console.log("5: Use item");
    console.log("6: Help");
    console.log("7: Quit game");
  } else if (currentLocation === "blacksmith") {
    console.log(
      "The heat from the forge fills the air. Weapons and armor line the walls."
    );
    console.log("\nWhat would you like to do?");
    console.log("1: Buy weapons or armor");
    console.log("2: Return to village");
    console.log("3: Check status");
    console.log("4: Use item");
    console.log("5: Help");
    console.log("6: Quit game");
  } else if (currentLocation === "market") {
    console.log(
      "Merchants sell their wares from colorful stalls. A potion seller catches your eye."
    );
    console.log("\nWhat would you like to do?");
    console.log("1: Buy potion (" + healthPotion.value + " gold)");
    console.log("2: Return to village");
    console.log("3: Check status");
    console.log("4: Use item");
    console.log("5: Help");
    console.log("6: Quit game");
  } else if (currentLocation === "forest") {
    console.log(
      "The forest is dark and foreboding. You hear strange noises all around you."
    );
    console.log("\nWhat would you like to do?");
    console.log("1: Return to village");
    console.log("2: Check status");
    console.log("3: Use item");
    console.log("4: Help");
    console.log("5: Hunt the Dragon's minions!");
    console.log("6: Face the Dragon!");
    console.log("7: Quit game");
  }
}

// ===========================
// Helper Functions
// Functions for item management
// ===========================

// Filter inventory list by type key
function getItemsByType(itemType) {
    let filteredInventory = inventory.filter(inv => inv.type.includes(itemType));
    return filteredInventory;
};

// Return best effect of a filter by type inventory list
function getBestItem(itemType) {
  let bestItemArray = getItemsByType(itemType);
  if (bestItemArray.length > 0) {
    let maxValue = 0;
    for (i = 0; i < bestItemArray.length; i++) {
        if (maxValue < bestItemArray[i].effect) {
            maxValue = bestItemArray[i].effect;
        }
    }
    // console.log("Debug getBestItem returns item");
    return bestItemArray.filter(inv => inv.effect === maxValue);
  } else {
    // console.log("Debug getBestItem returns null");
    return null;
  }
};

// Determine if equipment is good enough to face the dragon
// "Steel Sword" and any armor
function hasGoodEquipment() {
  bestWeapon = getBestItem("weapon");
  bestArmor = getBestItem("armor");
  if (bestWeapon === null) { bestWeapon = []; }
  if (bestArmor === null) { bestArmor = []; }
  // if (bestArmor.length === 0) { console.log("Debug: Empty Armor Array"); }
  if (bestWeapon.length > 0 && bestArmor.length > 0) {
    if (bestWeapon[0].name === "Steel Sword") {
      return true;
    } else {
      return false;
    }
  } else { 
    return false;
  }
}

// ===========================
// Combat Functions
// Functions that handle battles and health
// ===========================

/**
 * Checks if player has an item of specified type
 * @param {string} type The type of item to check for
 * @returns {boolean} True if player has the item type
 */
function hasItemType(type) {
  return inventory.some((item) => item.type === type);
}

/**
 * Checks if player has an item of specified type
 * @param {number} damage the basic damage of the attack
 * @param {number} reduction the amount of damage deflected/ignored
 * @returns {number} the amount of damage applied to the target, minimum of 1
 */
function handleDamage(damage, reduction) {
        if (reduction >= damage) {
          return -1;
        } else {
          return -(damage - reduction);
        }
}

/**
 * Handles monster battles
 * Checks if player has weapon and manages combat results
 * @param {boolean} isDragon true if dragon, default false
 * @returns {boolean} true if player wins, false if they retreat
 */
function handleCombat(isDragon = false) {
  if (isDragon && hasGoodEquipment()) {
    console.log("You are prepared to fight the dragon!")
  } else if (isDragon && !hasGoodEquipment()) {
    console.log("You are not prepared to face the dragon!");
   }
  let monsterName = "Minion";
  let monsterDamage = 10;
  let monsterHealth = 20;
  let monsterTreasure = 10;
  let monsterDefense = 5;
  if (isDragon) {
    monsterName = "Dragon";
    monsterDamage = 20;
    monsterHealth = 50;
    monsterTreasure = 50;
    monsterDefense = 10;
  }
  let weapon = getBestItem("weapon");
  let armor = getBestItem("armor");
  if (weapon === null) { weapon = []; }
  if (armor === null) { armor = []; }
  let playerDamageReduction = 0;
  if (armor.length > 0) {
    playerDamageReduction = armor[0].effect;
  }
  if (isDragon) { 
    console.log("The " + monsterName + "'s breath, claws, and teeth are terrible!");
    console.log("Its thick hide will shrug off ordinary weapons.");
  }
  if (!isDragon && weapon.length < 1) {
      console.log("The " + monsterName + "'s claws rake at you. Ouch!\nWithout a weapon, you must retreat!");
      if (armor.length > 0) {
        console.log("Luckily your shield reduced the damage!");
      }
      updateHealth(handleDamage(monsterDamage, playerDamageReduction));
      return false;
  }
  if (isDragon && (weapon.length < 1 || armor.length < 1)) {
    console.log("Without armor and a Steel Sword, you cannot defeat the " + monsterName + "!");
    console.log("You must retreat!");
    updateHealth(-monsterDamage);
    return false;
  }
  if (isDragon && weapon.length < 1) {
    console.log("Without armor and a Steel Sword, you cannot defeat the " + monsterName + "!");
    console.log("You must retreat!");
    if (armor.length > 0) {
      console.log("Luckily your shield reduced the damage!");
    }
    updateHealth(handleDamage(monsterDamage, playerDamageReduction));
    return false;
  }
  if (isDragon && weapon[0].name != "Steel Sword") {
    console.log("Without armor and a Steel Sword, you cannot defeat the " + monsterName + "!");
    console.log("You must retreat!");
    if (armor.length > 0) {
      console.log("Luckily your shield reduced the damage!");
    }
    updateHealth(handleDamage(monsterDamage, playerDamageReduction));
    return false;
  }
  if (armor.length < 1) {
      console.log("You brandish your " + weapon[0].name + " and advance to battle!");
  } else {
      console.log("You brandish your " + weapon[0].name + " and heft your " 
          + armor[0].name + " and advance to battle!");
  }
  while (monsterHealth > 0 && playerHealth > 0) {
    console.log("You attack! The " + monsterName + " loses " + weapon[0].effect + " health!");
    monsterHealth += handleDamage(weapon[0].effect, monsterDefense);
    if (monsterHealth <=0) {
        break;
    }
    console.log("The " + monsterName + " strikes back, doing " + monsterDamage + " damage to your heath!");
    if (armor.length > 0) {
      console.log("However, your shield blocks some of the damage!");
      playerDamageReduction = armor[0].effect;
    }
    updateHealth(handleDamage(monsterDamage, playerDamageReduction));
    if (playerHealth <= 0) {
        return false;
    }
  }
  playerGold += monsterTreasure;
  console.log("Congratulations! You have defeated the " + monsterName + "!");
  console.log("You gained " + monsterTreasure + " gold from its hoard!");
  if (isDragon) {
      console.log("You have won the game with " + playerGold + " gold!");
      showStatus();
      gameRunning = false;
  } 
  return true;
}

/**
 * Updates player health, keeping it between 0 and 100
 * @param {number} amount Amount to change health by (positive for healing, negative for damage)
 * @returns {number} The new health value
 */
function updateHealth(amount) {
  playerHealth += amount;

  if (playerHealth > 100) {
    playerHealth = 100;
    console.log("You're at full health!");
  }
  if (playerHealth < 0) {
    playerHealth = 0;
    console.log("You're gravely wounded!");
  }

  console.log("Health is now: " + playerHealth);
  return playerHealth;
}

// ===========================
// Item Functions
// Functions that handle item usage and inventory
// ===========================

/**
 * Handles using items like potions
 * @returns {boolean} true if item was used successfully, false if not
 */
function useItem() {
  if (inventory.length === 0) {
    console.log("\nYou have no items!");
    return false;
  }

  console.log("\n=== Inventory ===");
  inventory.forEach((item, index) => {
    console.log(index + 1 + ". " + item.name);
  });

  let choice = readline.question("Use which item? (number or 'cancel'): ");
  if (choice === "cancel") return false;

  let index = parseInt(choice) - 1;
  if (index >= 0 && index < inventory.length) {
    let item = inventory[index];

    if (item.type === "potion") {
      console.log("\nYou drink the " + item.name + ".");
      updateHealth(item.effect);
      inventory.splice(index, 1);
      console.log("Health restored to: " + playerHealth);
      return true;
    } else { // Old code: else if (item.type === "weapon") {
      console.log("\nYou ready your " + item.name + " for battle.");
      return true;
    }
  } else {
    console.log("\nInvalid item number!");
  }
  return false;
}

/**
 * Displays the player's inventory
 */
function checkInventory() {
  console.log("\n=== INVENTORY ===");
  if (inventory.length === 0) {
    console.log("Your inventory is empty!");
    return;
  }

  // Display all inventory items with numbers and descriptions
  inventory.forEach((item, index) => {
    console.log(index + 1 + ". " + item.name + " - " + item.description);
  });
}

// ===========================
// Shopping Functions
// Functions that handle buying items
// ===========================

/**
 * Handles purchasing items at the blacksmith
 */
function buyFromBlacksmith() {
  // console.log("\nBlacksmith: 'A fine blade for a brave adventurer!'");
  console.log("We have a variety of weapons and armor to choose from:");
  for (i=0; i < blacksmithItems.length; i++) {
      console.log((i+1), blacksmithItems[i].name + " - " + blacksmithItems[i].value + " gold")
  }
  console.log((i+1), "Don't buy anything at this time - 0 gold");
  let validItemChoice = false;
  while (!validItemChoice) {
    let itemChoice = readline.question("\nWhat would you like to buy, brave adventurer? ");
    // Check for empty input
    try {    
      if (itemChoice.trim() === "") {
          throw "Please enter a number!";
      }
      // Convert to number and check if it's a valid number
      let itemChoiceNum = parseInt(itemChoice);
      if (isNaN(itemChoiceNum)) {
          throw "That's not a number! Please enter a number.";
      }
      if (itemChoiceNum < 1 || itemChoiceNum > (blacksmithItems.length + 1)) {
          throw "Please enter a valid number.";
      }
      if (itemChoiceNum === (i+1)) { // Add an option not to buy anything
        console.log("Looking is free!")
        return; 
      }
      validItemChoice = true;
      let itemCheckArray = 
      inventory.filter(inv => inv.name.includes(blacksmithItems[itemChoiceNum -1].name));
      if (playerGold < blacksmithItems[itemChoiceNum -1].value) {
          throw "Blacksmith: 'You don't have enough gold for that " + 
          blacksmithItems[itemChoiceNum -1].name + "!'"
      } else if (itemCheckArray.length > 0) {
          throw "You already have a " + blacksmithItems[itemChoiceNum -1].name + "!'"
      }
      else {
          inventory.push(blacksmithItems[itemChoiceNum -1]);
          playerGold -= blacksmithItems[itemChoiceNum -1].value;
          console.log("You have bought a " + blacksmithItems[itemChoiceNum -1].name + 
              " for " + blacksmithItems[itemChoiceNum -1].value + " gold.");
          console.log("You have " + playerGold + " gold remaining!");
      }
    } catch (error) {
        console.log("Error: " + error);
        validItemChoice = false;
    }
  }
}

/**
 * Handles purchasing items at the market
 */
function buyFromMarket() {
  if (playerGold >= healthPotion.value) {
    console.log("\nMerchant: 'This potion will heal your wounds!'");
    playerGold -= healthPotion.value;

    // Add potion object to inventory instead of just the name
    inventory.push({ ...healthPotion }); // Create a copy of the potion object

    console.log(
      "You bought a " +
        healthPotion.name +
        " for " +
        healthPotion.value +
        " gold!"
    );
    console.log("Gold remaining: " + playerGold);
  } else {
    console.log("\nMerchant: 'No gold, no potion!'");
  }
}

// ===========================
// Help System
// Provides information about available commands
// ===========================

/**
 * Shows all available game commands and how to use them
 */
function showHelp() {
  console.log("\n=== AVAILABLE COMMANDS ===");

  console.log("\nMovement Commands:");
  console.log("- In the village, choose 1-3 to travel to different locations");
  console.log("- In other locations, choose the return option to go back to the village");

  console.log("\nBattle Information:");
  console.log("- You need a weapon to win battles");
  console.log("- Weapons have different damage values");
  console.log("- You can buy weapons and armor from the Blacksmith");
  console.log("- Monsters appear in the forest");
  console.log("- Without a weapon, you'll lose health when retreating");

  console.log("\nItem Usage:");
  console.log("- Health potions restore health based on their effect value");
  console.log("- You can buy potions at the market for " + healthPotion.value + " gold");
  console.log("- You can buy a sword at the blacksmith for " + sword.value + " gold");

  console.log("\nOther Commands:");
  console.log("- Choose the status option to see your health and gold");
  console.log("- Choose the help option to see this message again");
  console.log("- Choose the quit option to end the game");

  console.log("\nTips:");
  console.log("- Keep healing potions for dangerous areas");
  console.log("- Defeat monsters to earn gold");
  console.log("- Health can't go above 100");
}

// ===========================
// Movement Functions
// Functions that handle player movement
// ===========================

/**
 * Handles movement between locations
 * @param {number} choiceNum The chosen option number
 * @returns {boolean} True if movement was successful
 */
function move(choiceNum) {
  let validMove = false;

  if (currentLocation === "village") {
    if (choiceNum === 1) {
      currentLocation = "blacksmith";
      console.log("\nYou enter the blacksmith's shop.");
      validMove = true;
    } else if (choiceNum === 2) {
      currentLocation = "market";
      console.log("\nYou enter the market.");
      validMove = true;
      // No longer trigger combat when entering forest
    } else if (choiceNum === 3) {
      currentLocation = "forest";
      console.log("\nYou venture into the forest...");
      validMove = true;
    }
  } else if (currentLocation === "blacksmith") {
    if (choiceNum === 2) {
      currentLocation = "village";
      console.log("\nYou return to the village center.");
      validMove = true;
    }
  } else if (currentLocation === "market") {
    if (choiceNum === 2) {
      currentLocation = "village";
      console.log("\nYou return to the village center.");
      validMove = true;
    }
  } else if (currentLocation === "forest") {
    if (choiceNum === 1) {
      currentLocation = "village";
      console.log("\nYou hurry back to the safety of the village.");
      validMove = true;
    }
  }
  return validMove;
}

// ===========================
// Input Validation
// Functions that validate player input
// ===========================

/**
 * Validates if a choice number is within valid range
 * @param {string} input The user input to validate
 * @param {number} max The maximum valid choice number
 * @returns {boolean} True if choice is valid
 */
function isValidChoice(input, max) { // removed 2nd parameter "max"
  try {
      // Check for empty input
      if (input.trim() === "") {
        throw "Please enter a number!";
      }
      // Convert to number and check if it's a valid number
      let inputNum = parseInt(input);
      if (isNaN(inputNum)) {
        throw "That's not a number! Please enter a number.";
      }
      if (inputNum < 1 || inputNum > max) {
        throw "Please enter a number between 1 and " + max +".";
      }
  } catch (error) {
    console.log("Error: " + error);
    return false;
  }
  return true;
}

// ===========================
// Main Game Loop
// Controls the flow of the game
// ===========================

if (require.main === module) {
  console.log("=================================");
  console.log("       The Dragon's Quest        ");
  console.log("=================================");
  console.log("\nYour quest: Defeat the dragon in the mountains!");

  // Get player's name
  playerName = readline.question("\nWhat is your name, brave adventurer? ");
  console.log("\nWelcome, " + playerName + "!");
  console.log("You start with " + playerGold + " gold.");

  while (gameRunning) {
    // Show current location and choices
    showLocation();

    // Get and validate player choice
    let validChoice = false;
    while (!validChoice) {
      // try {
      let choice = readline.question("\nEnter choice (number): ");
      // Convert input choice to a number
      let choiceNum = parseInt(choice, 0);

      // Handle choices based on location
      if (currentLocation === "village") {
        validChoice = isValidChoice(choice, 7);
        if (choiceNum <= 3) {
          move(choiceNum);
        } else if (choiceNum === 4) {
          showStatus();
        } else if (choiceNum === 5) {
          useItem();
        } else if (choiceNum === 6) {
          showHelp();
        } else if (choiceNum === 7) {
          gameRunning = false;
          console.log("\nThanks for playing!");
        }
      } else if (currentLocation === "blacksmith") {
        validChoice = isValidChoice(choice, 6);
        if (choiceNum === 1) {
          buyFromBlacksmith();
        } else if (choiceNum === 2) {
          move(choiceNum);
        } else if (choiceNum === 3) {
          showStatus();
        } else if (choiceNum === 4) {
          useItem();
        } else if (choiceNum === 5) {
          showHelp();
        } else if (choiceNum === 6) {
          gameRunning = false;
          console.log("\nThanks for playing!");
        }
      } else if (currentLocation === "market") {
        validChoice = isValidChoice(choice, 6);
        if (choiceNum === 1) {
          buyFromMarket();
        } else if (choiceNum === 2) {
          move(choiceNum);
        } else if (choiceNum === 3) {
          showStatus();
        } else if (choiceNum === 4) {
          useItem();
        } else if (choiceNum === 5) {
          showHelp();
        } else if (choiceNum === 6) {
          gameRunning = false;
          console.log("\nThanks for playing!");
        }
      } else if (currentLocation === "forest") {
        validChoice = isValidChoice(choice, 7);
        if (choiceNum === 1) {
          move(choiceNum);
        } else if (choiceNum === 2) {
          showStatus();
        } else if (choiceNum === 3) {
          useItem();
        } else if (choiceNum === 4) {
          showHelp();
        } else if (choiceNum === 5) {
          handleCombat();
        } else if (choiceNum === 6) {
          handleCombat(true);
        } else if (choiceNum === 7) {
          gameRunning = false;
          console.log("\nThanks for playing!");
        }
      }
    }

    // Check if player died
    if (playerHealth <= 0) {
      console.log("\nGame Over! Your health reached 0!");
      gameRunning = false;
    }
  }
}
