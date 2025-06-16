
export interface SubclassInfo {
  name: string;
  description: string;
  features: string[];
  keyAbilities: string[];
  availableAtLevel: number;
  source: string;
}

export interface ClassArchetypes {
  name: string;
  description: string;
  primaryAbility: string[];
  hitDie: number;
  proficiencies: {
    armor: string;
    weapons: string;
    tools: string;
    savingThrows: string;
    skills: string;
  };
  keyFeatures: string[];
  subclasses: SubclassInfo[];
}

export const classArchetypes: Record<string, ClassArchetypes> = {
  'Fighter': {
    name: 'Fighter',
    description: 'Masters of martial combat, skilled with a variety of weapons and armor.',
    primaryAbility: ['Strength', 'Dexterity'],
    hitDie: 10,
    proficiencies: {
      armor: 'All armor, shields',
      weapons: 'Simple weapons, martial weapons',
      tools: '',
      savingThrows: 'Strength, Constitution',
      skills: 'Choose 2 from Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, Survival'
    },
    keyFeatures: ['Fighting Style', 'Second Wind', 'Action Surge', 'Extra Attack'],
    subclasses: [
      {
        name: 'Champion',
        description: 'A master of weapons and combat techniques, focused on physical prowess and improved critical hits.',
        features: ['Improved Critical (19-20)', 'Remarkable Athlete', 'Additional Fighting Style'],
        keyAbilities: ['Strength', 'Dexterity'],
        availableAtLevel: 3,
        source: 'Core Rules'
      },
      {
        name: 'Battle Master',
        description: 'A tactical fighter who uses special maneuvers to control the battlefield.',
        features: ['Combat Superiority', 'Maneuvers', 'Know Your Enemy'],
        keyAbilities: ['Strength', 'Dexterity', 'Intelligence'],
        availableAtLevel: 3,
        source: 'Core Rules'
      },
      {
        name: 'Eldritch Knight',
        description: 'A fighter who supplements martial prowess with magical abilities.',
        features: ['Spellcasting', 'Weapon Bond', 'War Magic'],
        keyAbilities: ['Strength', 'Intelligence'],
        availableAtLevel: 3,
        source: 'Core Rules'
      }
    ]
  },
  'Wizard': {
    name: 'Wizard',
    description: 'Scholarly magic-users capable of manipulating the structures of spellcasting.',
    primaryAbility: ['Intelligence'],
    hitDie: 6,
    proficiencies: {
      armor: '',
      weapons: 'Daggers, darts, slings, quarterstaffs, light crossbows',
      tools: '',
      savingThrows: 'Intelligence, Wisdom',
      skills: 'Choose 2 from Arcana, History, Insight, Investigation, Medicine, Religion'
    },
    keyFeatures: ['Spellcasting', 'Arcane Recovery', 'Spell Mastery', 'Signature Spells'],
    subclasses: [
      {
        name: 'School of Evocation',
        description: 'Masters of destructive magic who can shape their spells to avoid allies.',
        features: ['Sculpt Spells', 'Potent Cantrip', 'Empowered Evocation'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      },
      {
        name: 'School of Abjuration',
        description: 'Protective magic specialists who excel at warding and counterspelling.',
        features: ['Abjuration Savant', 'Arcane Ward', 'Projected Ward'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      },
      {
        name: 'School of Conjuration',
        description: 'Masters of summoning creatures and creating objects from thin air.',
        features: ['Conjuration Savant', 'Minor Conjuration', 'Benign Transposition'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      },
      {
        name: 'School of Divination',
        description: 'Seers who use magic to uncover secrets and predict the future.',
        features: ['Divination Savant', 'Portent', 'Expert Divination'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      },
      {
        name: 'School of Enchantment',
        description: 'Masters of charm and mind control magic.',
        features: ['Enchantment Savant', 'Hypnotic Gaze', 'Charming Words'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      },
      {
        name: 'School of Illusion',
        description: 'Specialists in deception and misdirection through magical illusions.',
        features: ['Illusion Savant', 'Improved Minor Illusion', 'Malleable Illusions'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      },
      {
        name: 'School of Necromancy',
        description: 'Masters of death magic and the undead.',
        features: ['Necromancy Savant', 'Grim Harvest', 'Undead Thralls'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      },
      {
        name: 'School of Transmutation',
        description: 'Specialists in changing and transforming matter and energy.',
        features: ['Transmutation Savant', 'Minor Alchemy', 'Transmuter\'s Stone'],
        keyAbilities: ['Intelligence'],
        availableAtLevel: 2,
        source: 'Core Rules'
      }
    ]
  },
  'Rogue': {
    name: 'Rogue',
    description: 'Skilled in stealth and subterfuge, rogues have a knack for getting into and out of trouble.',
    primaryAbility: ['Dexterity'],
    hitDie: 8,
    proficiencies: {
      armor: 'Light armor',
      weapons: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords',
      tools: "Thieves' tools",
      savingThrows: 'Dexterity, Intelligence',
      skills: 'Choose 4 from Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, Stealth'
    },
    keyFeatures: ['Expertise', 'Sneak Attack', 'Cunning Action', 'Uncanny Dodge'],
    subclasses: [
      {
        name: 'Thief',
        description: 'A master of infiltration and quick hands, with unparalleled climbing and sleight of hand.',
        features: ['Fast Hands', 'Second-Story Work', "Thief's Reflexes"],
        keyAbilities: ['Dexterity'],
        availableAtLevel: 3,
        source: 'Core Rules'
      },
      {
        name: 'Assassin',
        description: 'A deadly killer who strikes from the shadows with poison and surprise attacks.',
        features: ['Bonus Proficiencies', 'Assassinate', 'Infiltration Expertise'],
        keyAbilities: ['Dexterity'],
        availableAtLevel: 3,
        source: 'Core Rules'
      },
      {
        name: 'Arcane Trickster',
        description: 'A rogue who enhances their abilities with magic, focusing on illusion and enchantment.',
        features: ['Spellcasting', 'Mage Hand Legerdemain', 'Magical Ambush'],
        keyAbilities: ['Dexterity', 'Intelligence'],
        availableAtLevel: 3,
        source: 'Core Rules'
      }
    ]
  },
  'Cleric': {
    name: 'Cleric',
    description: 'Divine spellcasters who serve their deities through prayer and divine magic.',
    primaryAbility: ['Wisdom'],
    hitDie: 8,
    proficiencies: {
      armor: 'Light armor, medium armor, shields',
      weapons: 'Simple weapons',
      tools: '',
      savingThrows: 'Wisdom, Charisma',
      skills: 'Choose 2 from History, Insight, Medicine, Persuasion, Religion'
    },
    keyFeatures: ['Spellcasting', 'Divine Domain', 'Channel Divinity', 'Divine Intervention'],
    subclasses: [
      {
        name: 'Life Domain',
        description: 'Clerics who focus on healing and protecting life.',
        features: ['Bonus Proficiency', 'Disciple of Life', 'Channel Divinity: Preserve Life'],
        keyAbilities: ['Wisdom'],
        availableAtLevel: 1,
        source: 'Core Rules'
      },
      {
        name: 'Light Domain',
        description: 'Clerics who wield the power of light and fire against darkness.',
        features: ['Bonus Cantrip', 'Warding Flare', 'Channel Divinity: Radiance of the Dawn'],
        keyAbilities: ['Wisdom'],
        availableAtLevel: 1,
        source: 'Core Rules'
      },
      {
        name: 'Knowledge Domain',
        description: 'Clerics who seek to preserve and share knowledge.',
        features: ['Blessings of Knowledge', 'Channel Divinity: Knowledge of the Ages'],
        keyAbilities: ['Wisdom', 'Intelligence'],
        availableAtLevel: 1,
        source: 'Core Rules'
      }
    ]
  },
  'Barbarian': {
    name: 'Barbarian',
    description: 'Fierce warriors who can enter a battle rage, drawing on primal powers.',
    primaryAbility: ['Strength'],
    hitDie: 12,
    proficiencies: {
      armor: 'Light armor, medium armor, shields',
      weapons: 'Simple weapons, martial weapons',
      tools: '',
      savingThrows: 'Strength, Constitution',
      skills: 'Choose 2 from Animal Handling, Athletics, Intimidation, Nature, Perception, Survival'
    },
    keyFeatures: ['Rage', 'Unarmored Defense', 'Reckless Attack', 'Danger Sense'],
    subclasses: [
      {
        name: 'Path of the Berserker',
        description: 'Barbarians who channel their rage into frenzied combat.',
        features: ['Frenzy', 'Mindless Rage', 'Intimidating Presence'],
        keyAbilities: ['Strength', 'Constitution'],
        availableAtLevel: 3,
        source: 'Core Rules'
      },
      {
        name: 'Path of the Totem Warrior',
        description: 'Barbarians who draw power from animal spirits.',
        features: ['Spirit Seeker', 'Totem Spirit', 'Aspect of the Beast'],
        keyAbilities: ['Strength', 'Wisdom'],
        availableAtLevel: 3,
        source: 'Core Rules'
      }
    ]
  },
  'Bard': {
    name: 'Bard',
    description: 'Masters of song, speech, and magic, wielding the power of inspiration.',
    primaryAbility: ['Charisma'],
    hitDie: 8,
    proficiencies: {
      armor: 'Light armor',
      weapons: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords',
      tools: 'Three musical instruments of your choice',
      savingThrows: 'Dexterity, Charisma',
      skills: 'Choose any three'
    },
    keyFeatures: ['Spellcasting', 'Bardic Inspiration', 'Jack of All Trades', 'Expertise'],
    subclasses: [
      {
        name: 'College of Lore',
        description: 'Bards who gather knowledge and secrets from all sources.',
        features: ['Bonus Proficiencies', 'Cutting Words', 'Additional Magical Secrets'],
        keyAbilities: ['Charisma', 'Intelligence'],
        availableAtLevel: 3,
        source: 'Core Rules'
      },
      {
        name: 'College of Valor',
        description: 'Bards who inspire others in battle and fight alongside them.',
        features: ['Bonus Proficiencies', 'Combat Inspiration', 'Extra Attack'],
        keyAbilities: ['Charisma', 'Strength'],
        availableAtLevel: 3,
        source: 'Core Rules'
      }
    ]
  }
};

// Helper function to get subclasses available at character creation (level 1-3)
export const getAvailableSubclasses = (className: string, level: number = 1): SubclassInfo[] => {
  const classData = classArchetypes[className];
  if (!classData) return [];
  
  return classData.subclasses.filter(subclass => subclass.availableAtLevel <= level);
};

// Helper function to get all subclasses for a class
export const getAllSubclasses = (className: string): SubclassInfo[] => {
  const classData = classArchetypes[className];
  if (!classData) return [];
  
  return classData.subclasses;
};
