export interface HabitBenefit {
  physical: string
  mental: string
  chemicals: {
    dopamine?: string
    serotonin?: string
    oxytocin?: string
    endorphins?: string
  }
}

export const HABIT_BENEFITS: Record<string, HabitBenefit> = {
  'Water (min. 1.5lt)': {
    physical: 'Supports kidney function, improves skin elasticity, regulates body temperature, and aids digestion and nutrient absorption.',
    mental: 'Even mild dehydration impairs concentration, memory and mood. Staying hydrated sharpens focus and reduces fatigue.',
    chemicals: {
      serotonin: 'Proper hydration supports serotonin synthesis, which stabilises mood and promotes a sense of calm.',
      dopamine: 'Dehydration suppresses dopamine production — hydration keeps motivation and reward pathways functioning.',
    }
  },
  'Meditation': {
    physical: 'Lowers blood pressure, reduces cortisol levels, improves sleep quality, and strengthens immune response.',
    mental: 'Builds emotional regulation, reduces anxiety and rumination, increases attention span and self-awareness.',
    chemicals: {
      serotonin: 'Regular meditation significantly raises serotonin levels, supporting mood stability and inner calm.',
      dopamine: 'Increases dopamine release, creating a natural sense of reward and motivation.',
      endorphins: 'Activates endorphin release, producing a sense of ease and mild euphoria.',
    }
  },
  'Morning phone fasting': {
    physical: 'Reduces eye strain and blue light exposure. Allows cortisol to peak naturally without artificial stimulation.',
    mental: 'Protects your first waking hour from reactive thinking. Creates space for intention-setting and reduces anxiety.',
    chemicals: {
      dopamine: 'Phones trigger constant dopamine micro-spikes. Fasting resets your baseline, making real rewards feel meaningful again.',
      serotonin: 'Reduces early-morning stress response, allowing serotonin to rise naturally with daylight.',
    }
  },
  'Cold shower': {
    physical: 'Improves circulation, reduces muscle soreness, boosts metabolism, and strengthens the immune system over time.',
    mental: 'Builds mental resilience and discipline. The controlled discomfort trains your ability to tolerate stress.',
    chemicals: {
      endorphins: 'Cold water triggers a significant endorphin rush — the same chemicals released during exercise.',
      dopamine: 'Studies show cold exposure raises dopamine levels by up to 250%, sustaining elevated mood for hours.',
      serotonin: 'Activates serotonin pathways, contributing to a lasting sense of alertness and wellbeing.',
    }
  },
  'Physical connection': {
    physical: 'Touch reduces heart rate, lowers blood pressure, and activates the parasympathetic nervous system.',
    mental: 'Physical connection is one of the most powerful antidotes to loneliness, stress and emotional dysregulation.',
    chemicals: {
      oxytocin: 'Physical touch is the primary trigger for oxytocin — the bonding hormone that builds trust and safety.',
      serotonin: 'Connection raises serotonin, contributing to emotional stability and a sense of belonging.',
      dopamine: 'Positive social interaction activates dopamine reward circuits, reinforcing connection-seeking behaviour.',
    }
  },
  'Meet a friend / family': {
    physical: 'Social connection is linked to stronger immunity, lower inflammation, and longer lifespan.',
    mental: 'In-person connection reduces feelings of isolation, improves mood, and provides perspective on problems.',
    chemicals: {
      oxytocin: 'Face-to-face interaction with loved ones is a powerful oxytocin trigger, deepening bonds.',
      serotonin: 'Being seen and valued by others raises serotonin, supporting a stable sense of self-worth.',
      dopamine: 'Shared experiences and laughter activate dopamine, making connection inherently rewarding.',
    }
  },
  'Phone a friend / family': {
    physical: 'Even voice-based connection reduces stress hormones and lowers blood pressure.',
    mental: 'A meaningful conversation can shift your entire emotional state, reduce rumination and build resilience.',
    chemicals: {
      oxytocin: 'Hearing a loved one\'s voice triggers oxytocin release, even without physical presence.',
      serotonin: 'Feeling connected and cared for raises serotonin levels and emotional stability.',
    }
  },
  'Sun (min. 10 min)': {
    physical: 'Stimulates vitamin D production, regulates circadian rhythm, and supports bone health and immune function.',
    mental: 'Morning sunlight is one of the most powerful mood regulators available. It anchors your body clock.',
    chemicals: {
      serotonin: 'Sunlight is the primary natural trigger for serotonin production — the foundation of positive mood.',
      dopamine: 'Light exposure activates dopamine pathways, improving motivation and energy levels.',
    }
  },
  'Walk in nature': {
    physical: 'Gentle cardiovascular exercise, improves joint mobility, reduces inflammation and supports metabolic health.',
    mental: 'Nature exposure reduces cortisol, quiets the default mode network (rumination), and restores attention.',
    chemicals: {
      serotonin: 'Nature walks increase serotonin production through light, movement and reduced stress.',
      endorphins: 'Even gentle walking triggers endorphin release, particularly when combined with fresh air.',
      dopamine: 'Novel natural environments stimulate dopamine curiosity pathways.',
    }
  },
  'Fruit & veg (min. 8 types)': {
    physical: 'Diverse plant foods support gut microbiome diversity, reduce inflammation, and provide essential micronutrients.',
    mental: 'The gut-brain axis means what you eat directly affects mood, anxiety and cognitive function.',
    chemicals: {
      serotonin: '95% of serotonin is produced in the gut. A diverse plant diet feeds the bacteria that make it.',
      dopamine: 'Certain plant foods (particularly those rich in tyrosine) support dopamine production.',
    }
  },
  'Sleep 7-9 hours': {
    physical: 'Sleep is when the body repairs tissue, consolidates muscle, regulates hormones and clears metabolic waste from the brain.',
    mental: 'Sleep deprivation impairs every cognitive function. Quality sleep is the single most impactful mental health intervention.',
    chemicals: {
      serotonin: 'Sleep regulates serotonin receptor sensitivity — poor sleep disrupts mood the following day.',
      dopamine: 'Sleep restores dopamine receptor density. Chronic sleep loss leads to reduced motivation and pleasure.',
      endorphins: 'Deep sleep stages trigger growth hormone and endorphin release, supporting recovery and wellbeing.',
    }
  },
  'Walk (10,000 steps)': {
    physical: 'Sustained walking improves cardiovascular health, supports weight regulation, and reduces all-cause mortality risk.',
    mental: 'Walking — especially outdoors — is one of the most evidence-backed interventions for depression and anxiety.',
    chemicals: {
      endorphins: 'Sustained walking triggers significant endorphin release, creating a lasting mood elevation.',
      serotonin: 'Regular daily movement is a key driver of baseline serotonin production.',
      dopamine: 'Reaching step goals activates dopamine reward circuits, reinforcing the habit loop.',
    }
  },
  'Stretch class (20 min)': {
    physical: 'Improves flexibility, reduces injury risk, relieves muscle tension, and supports joint health and posture.',
    mental: 'Stretching activates the parasympathetic nervous system, shifting the body from stress to rest mode.',
    chemicals: {
      endorphins: 'Stretching releases endorphins, particularly when combined with breath work.',
      serotonin: 'The relaxation response from stretching raises serotonin and lowers cortisol.',
    }
  },
  'FIIT class (25-40 min)': {
    physical: 'High-intensity interval training improves cardiovascular fitness, builds strength, and boosts metabolism for hours after.',
    mental: 'Intense exercise is one of the most powerful mood interventions — effects can last up to 12 hours.',
    chemicals: {
      endorphins: 'High-intensity exercise triggers the largest endorphin release of any common activity.',
      dopamine: 'Exercise-induced dopamine provides a powerful natural reward that builds intrinsic motivation.',
      serotonin: 'Post-exercise serotonin elevation is well documented, contributing to the "runner\'s high" effect.',
    }
  },
}

export const CHEMICAL_INFO = {
  dopamine: { label: 'Dopamine', color: '#c9963a', emoji: '🟡', description: 'Motivation & reward' },
  serotonin: { label: 'Serotonin', color: '#4a7c8a', emoji: '🔵', description: 'Mood & calm' },
  oxytocin: { label: 'Oxytocin', color: '#c06080', emoji: '🩷', description: 'Bonding & trust' },
  endorphins: { label: 'Endorphins', color: '#7a9c5c', emoji: '🟢', description: 'Euphoria & relief' },
}
