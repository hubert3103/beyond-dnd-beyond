
export interface SubclassInfo {
  name: string;
  description: string;
  features: string[];
  keyAbilities: string[];
}

export interface ClassInfo {
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
}

export const subclassData: Record<string, SubclassInfo[]> = {
  'Fighter': [
    {
      name: 'Champion',
      description: 'A master of weapons and combat techniques, focused on physical prowess and improved critical hits.',
      features: ['Improved Critical (19-20)', 'Remarkable Athlete', 'Additional Fighting Style'],
      keyAbilities: ['Strength', 'Dexterity']
    },
    {
      name: 'Battle Master',
      description: 'A tactical fighter who uses special maneuvers to control the battlefield.',
      features: ['Combat Superiority', 'Maneuvers', 'Know Your Enemy'],
      keyAbilities: ['Strength', 'Dexterity', 'Intelligence']
    },
    {
      name: 'Eldritch Knight',
      description: 'A fighter who supplements martial prowess with magical abilities.',
      features: ['Spellcasting', 'Weapon Bond', 'War Magic'],
      keyAbilities: ['Strength', 'Intelligence']
    }
  ],
  'Wizard': [
    {
      name: 'School of Evocation',
      description: 'Masters of destructive magic who can shape their spells to avoid allies.',
      features: ['Sculpt Spells', 'Potent Cantrip', 'Empowered Evocation'],
      keyAbilities: ['Intelligence']
    },
    {
      name: 'School of Abjuration',
      description: 'Protective magic specialists who excel at warding and counterspelling.',
      features: ['Abjuration Savant', 'Arcane Ward', 'Projected Ward'],
      keyAbilities: ['Intelligence']
    },
    {
      name: 'School of Conjuration',
      description: 'Masters of summoning creatures and creating objects from thin air.',
      features: ['Conjuration Savant', 'Minor Conjuration', 'Benign Transposition'],
      keyAbilities: ['Intelligence']
    },
    {
      name: 'School of Divination',
      description: 'Seers who use magic to uncover secrets and predict the future.',
      features: ['Divination Savant', 'Portent', 'Expert Divination'],
      keyAbilities: ['Intelligence']
    },
    {
      name: 'School of Enchantment',
      description: 'Masters of charm and mind control magic.',
      features: ['Enchantment Savant', 'Hypnotic Gaze', 'Charming Words'],
      keyAbilities: ['Intelligence']
    },
    {
      name: 'School of Illusion',
      description: 'Specialists in deception and misdirection through magical illusions.',
      features: ['Illusion Savant', 'Improved Minor Illusion', 'Malleable Illusions'],
      keyAbilities: ['Intelligence']
    },
    {
      name: 'School of Necromancy',
      description: 'Masters of death magic and the undead.',
      features: ['Necromancy Savant', 'Grim Harvest', 'Undead Thralls'],
      keyAbilities: ['Intelligence']
    },
    {
      name: 'School of Transmutation',
      description: 'Specialists in changing and transforming matter and energy.',
      features: ['Transmutation Savant', 'Minor Alchemy', 'Transmuter\'s Stone'],
      keyAbilities: ['Intelligence']
    }
  ],
  'Rogue': [
    {
      name: 'Thief',
      description: 'A master of infiltration and quick hands, with unparalleled climbing and sleight of hand.',
      features: ['Fast Hands', 'Second-Story Work', "Thief's Reflexes"],
      keyAbilities: ['Dexterity']
    },
    {
      name: 'Assassin',
      description: 'A deadly killer who strikes from the shadows with poison and surprise attacks.',
      features: ['Bonus Proficiencies', 'Assassinate', 'Infiltration Expertise'],
      keyAbilities: ['Dexterity']
    }
  ]
};

export const classData: Record<string, ClassInfo> = {
  'Fighter': {
    name: 'Fighter',
    description: 'Masters of martial combat, skilled with a variety of weapons and armor. Fighters learn to fight as a team and as individuals.',
    primaryAbility: ['Strength', 'Dexterity'],
    hitDie: 10,
    proficiencies: {
      armor: 'All armor, shields',
      weapons: 'Simple weapons, martial weapons',
      tools: '',
      savingThrows: 'Strength, Constitution',
      skills: 'Choose 2 from Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, Survival'
    },
    keyFeatures: ['Fighting Style', 'Second Wind', 'Action Surge', 'Extra Attack']
  },
  'Wizard': {
    name: 'Wizard',
    description: 'Scholarly magic-users capable of manipulating the structures of spellcasting to cast spells of exceptional power.',
    primaryAbility: ['Intelligence'],
    hitDie: 6,
    proficiencies: {
      armor: '',
      weapons: 'Daggers, darts, slings, quarterstaffs, light crossbows',
      tools: '',
      savingThrows: 'Intelligence, Wisdom',
      skills: 'Choose 2 from Arcana, History, Insight, Investigation, Medicine, Religion'
    },
    keyFeatures: ['Spellcasting', 'Arcane Recovery', 'Spell Mastery', 'Signature Spells']
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
    keyFeatures: ['Expertise', 'Sneak Attack', 'Cunning Action', 'Uncanny Dodge']
  }
};
