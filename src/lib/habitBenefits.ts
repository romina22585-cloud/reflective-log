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
  'Drink Water (1.5+ lt)': {
    physical: 'Supports kidney function, improves skin elasticity, regulates body temperature, and aids digestion and nutrient absorption.',
    mental: 'Even mild dehydration impairs concentration, memory and mood. Staying hydrated sharpens focus and reduces fatigue.',
    chemicals: {
      serotonin: 'Proper hydration supports serotonin synthesis, which stabilises mood and promotes a sense of calm.',
      dopamine: 'Dehydration suppresses dopamine production — hydration keeps motivation and reward pathways functioning.',
    }
  },
  'Morning phone fasting (first 30+ min)': {
    physical: 'Reduces eye strain and blue light exposure. Allows cortisol to peak naturally without artificial stimulation.',
    mental: 'Protects your first waking hour from reactive thinking. Creates space for intention-setting and reduces anxiety.',
    chemicals: {
      dopamine: 'Phones trigger constant dopamine micro-spikes. Fasting resets your baseline, making real rewards feel meaningful again.',
      serotonin: 'Reduces early-morning stress response, allowing serotonin to rise naturally with daylight.',
    }
  },
  'Physical connection (pet or person)': {
    physical: 'Touch reduces heart rate, lowers blood pressure, and activates the parasympathetic nervous system.',
    mental: 'Physical connection is one of the most powerful antidotes to loneliness, stress and emotional dysregulation.',
    chemicals: {
      oxytocin: 'Physical touch is the primary trigger for oxytocin — the bonding hormone that builds trust and safety.',
      serotonin: 'Connection raises serotonin, contributing to emotional stability and a sense of belonging.',
      dopamine: 'Positive social interaction activates dopamine reward circuits, reinforcing connection-seeking behaviour.',
    }
  },
  'Hug someone': {
    physical: 'A 20-second hug is enough to trigger a measurable drop in cortisol and blood pressure. Regular hugging strengthens immune function.',
    mental: 'Hugging is one of the fastest ways to shift emotional state. It signals safety to the nervous system and reduces feelings of isolation.',
    chemicals: {
      oxytocin: 'Hugging is one of the strongest natural oxytocin triggers — it deepens bonds, builds trust, and creates a felt sense of safety.',
      serotonin: 'The warmth and pressure of a hug activates serotonin pathways, stabilising mood almost immediately.',
      endorphins: 'Physical embrace triggers endorphin release, producing a mild but lasting sense of comfort and ease.',
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
  'Sunlight (10+ min)': {
    physical: 'Stimulates vitamin D production, regulates circadian rhythm, and supports bone health and immune function.',
    mental: 'Morning sunlight is one of the most powerful mood regulators available. It anchors your body clock.',
    chemicals: {
      serotonin: 'Sunlight is the primary natural trigger for serotonin production — the foundation of positive mood.',
      dopamine: 'Light exposure activates dopamine pathways, improving motivation and energy levels.',
    }
  },
  'Eat Fruit & veg (8+ types)': {
    physical: 'Diverse plant foods support gut microbiome diversity, reduce inflammation, and provide essential micronutrients.',
    mental: 'The gut-brain axis means what you eat directly affects mood, anxiety and cognitive function.',
    chemicals: {
      serotonin: '95% of serotonin is produced in the gut. A diverse plant diet feeds the bacteria that make it.',
      dopamine: 'Certain plant foods (particularly those rich in tyrosine) support dopamine production.',
    }
  },
  'Sleep (7-9 hs)': {
    physical: 'Sleep is when the body repairs tissue, consolidates muscle, regulates hormones and clears metabolic waste from the brain.',
    mental: 'Sleep deprivation impairs every cognitive function. Quality sleep is the single most impactful mental health intervention.',
    chemicals: {
      serotonin: 'Sleep regulates serotonin receptor sensitivity — poor sleep disrupts mood the following day.',
      dopamine: 'Sleep restores dopamine receptor density. Chronic sleep loss leads to reduced motivation and pleasure.',
      endorphins: 'Deep sleep stages trigger growth hormone and endorphin release, supporting recovery and wellbeing.',
    }
  },
  'Walk (10k+ steps)': {
    physical: 'Sustained walking improves cardiovascular health, supports weight regulation, and reduces all-cause mortality risk.',
    mental: 'Walking — especially outdoors — is one of the most evidence-backed interventions for depression and anxiety.',
    chemicals: {
      endorphins: 'Sustained walking triggers significant endorphin release, creating a lasting mood elevation.',
      serotonin: 'Regular daily movement is a key driver of baseline serotonin production.',
      dopamine: 'Reaching step goals activates dopamine reward circuits, reinforcing the habit loop.',
    }
  },
  'No Ultra-processed food': {
    physical: 'Ultra-processed foods are linked to inflammation, metabolic dysfunction, cardiovascular disease and accelerated ageing. Avoiding them reduces these risks significantly.',
    mental: 'Processed food additives disrupt the gut microbiome, which directly impacts mood, anxiety and cognitive clarity.',
    chemicals: {
      dopamine: 'Ultra-processed foods are engineered to trigger dopamine spikes followed by crashes — avoiding them stabilises your reward system.',
      serotonin: 'A healthy gut microbiome, supported by whole foods, produces more serotonin and reduces mood instability.',
    }
  },
  'Meditation (10+ min)': {
    physical: 'Lowers blood pressure, reduces cortisol levels, improves sleep quality, and strengthens immune response.',
    mental: 'Builds emotional regulation, reduces anxiety and rumination, increases attention span and self-awareness.',
    chemicals: {
      serotonin: 'Regular meditation significantly raises serotonin levels, supporting mood stability and inner calm.',
      dopamine: 'Increases dopamine release, creating a natural sense of reward and motivation.',
      endorphins: 'Activates endorphin release, producing a sense of ease and mild euphoria.',
    }
  },
  'Stretch (20+ min)': {
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
  'Cold shower (1+ min)': {
    physical: 'Improves circulation, reduces muscle soreness, boosts metabolism, and strengthens the immune system over time.',
    mental: 'Builds mental resilience and discipline. The controlled discomfort trains your ability to tolerate stress.',
    chemicals: {
      endorphins: 'Cold water triggers a significant endorphin rush — the same chemicals released during exercise.',
      dopamine: 'Studies show cold exposure raises dopamine levels by up to 250%, sustaining elevated mood for hours.',
      serotonin: 'Activates serotonin pathways, contributing to a lasting sense of alertness and wellbeing.',
    }
  },
  'Journaling / Reflection': {
    physical: 'Regular expressive writing has been shown to reduce cortisol, lower blood pressure, and improve immune markers in clinical studies.',
    mental: 'Journaling externalises internal experience, reducing the cognitive load of unprocessed emotion. It builds self-awareness and emotional intelligence over time.',
    chemicals: {
      dopamine: 'Completing a reflection activates dopamine reward circuits — the act of closure is inherently satisfying.',
      serotonin: 'Processing difficult experiences through writing reduces rumination and raises baseline serotonin.',
    }
  },
  'No sugar': {
    physical: 'Reducing added sugar lowers inflammation, stabilises blood glucose, reduces risk of metabolic disease, and improves skin health.',
    mental: 'Sugar causes rapid dopamine spikes followed by crashes — eliminating it creates more stable energy and mood throughout the day.',
    chemicals: {
      dopamine: 'Sugar creates a dopamine spike similar to addictive substances. Removing it allows your dopamine system to reset to healthier baseline levels.',
      serotonin: 'Stable blood sugar supports more consistent serotonin production, reducing mood swings and irritability.',
    }
  },
  'No alcohol': {
    physical: 'Even moderate alcohol disrupts sleep architecture, inflames the gut, taxes the liver, and suppresses immune function. Abstaining reverses these effects.',
    mental: 'Alcohol is a depressant that disrupts neurotransmitter balance. Removing it leads to more stable mood, better sleep quality, and sharper cognition.',
    chemicals: {
      serotonin: 'Alcohol depletes serotonin over time. Abstaining allows serotonin levels to recover and stabilise.',
      dopamine: 'Alcohol hijacks dopamine reward pathways. Without it, the brain gradually restores natural motivation and pleasure responses.',
      endorphins: 'Alcohol artificially stimulates endorphin release. Over time, the brain compensates by reducing natural endorphin production — abstaining allows recovery.',
    }
  },
  'No smoking': {
    physical: 'Stopping smoking begins reversing cardiovascular damage within 24 hours. Lung function improves, inflammation reduces, and cancer risk falls significantly over time.',
    mental: 'Nicotine creates a cycle of artificial dopamine stimulation followed by withdrawal anxiety. Breaking this cycle restores natural mood regulation.',
    chemicals: {
      dopamine: 'Nicotine floods the dopamine system, then depletes it during withdrawal. Quitting allows your natural dopamine baseline to recover over weeks.',
      serotonin: 'Smoking disrupts serotonin regulation. Abstaining gradually restores mood stability and reduces anxiety.',
      endorphins: 'The body\'s natural endorphin system is suppressed by chronic nicotine use — recovery leads to more sustainable feelings of wellbeing.',
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
  'Walk in nature (30+ min)': {
    physical: 'Gentle cardiovascular exercise, improves joint mobility, reduces inflammation and supports metabolic health.',
    mental: 'Nature exposure reduces cortisol, quiets the default mode network (rumination), and restores attention.',
    chemicals: {
      serotonin: 'Nature walks increase serotonin production through light, movement and reduced stress.',
      endorphins: 'Even gentle walking triggers endorphin release, particularly when combined with fresh air.',
      dopamine: 'Novel natural environments stimulate dopamine curiosity pathways.',
    }
  },
  'Heat - Hot bath/Sauna': {
    physical: 'Heat exposure improves circulation, relaxes muscles, reduces inflammation, and triggers the release of growth hormone. Regular sauna use is linked to reduced cardiovascular risk.',
    mental: 'The deliberate relaxation of heat exposure trains the nervous system to shift from fight-or-flight to rest-and-digest. It is deeply restorative.',
    chemicals: {
      endorphins: 'Heat stress triggers significant endorphin release, creating a powerful natural sense of ease and euphoria.',
      dopamine: 'Post-heat dopamine elevation mirrors the effect of cold exposure — both are forms of beneficial stress that upregulate reward circuits.',
      serotonin: 'The deep relaxation that follows heat exposure is partly driven by serotonin, supporting calm and sleep quality.',
    }
  },
  'Act of kindness': {
    physical: 'Acts of kindness have been shown to reduce cortisol, lower blood pressure, and support immune function. Giving activates the same reward centres as receiving.',
    mental: 'Prosocial behaviour is one of the most reliable predictors of subjective wellbeing. Doing something for others shifts focus outward and interrupts rumination.',
    chemicals: {
      oxytocin: 'Acts of kindness — particularly those involving direct human connection — trigger oxytocin release in both giver and receiver.',
      dopamine: 'Helping others activates the brain\'s reward system strongly — sometimes called the "helper\'s high".',
      serotonin: 'Witnessing or performing acts of kindness raises serotonin in all parties involved, including bystanders.',
      endorphins: 'The warm feeling after doing something kind is partly driven by endorphin release, reinforcing prosocial behaviour.',
    }
  },
}

export const CHEMICAL_INFO = {
  dopamine: { label: 'Dopamine', color: '#c9963a', emoji: '🟡', description: 'Motivation & reward' },
  serotonin: { label: 'Serotonin', color: '#4a7c8a', emoji: '🔵', description: 'Mood & calm' },
  oxytocin: { label: 'Oxytocin', color: '#c06080', emoji: '🩷', description: 'Bonding & trust' },
  endorphins: { label: 'Endorphins', color: '#7a9c5c', emoji: '🟢', description: 'Euphoria & relief' },
}

export type HabitGroup = 'daily' | 'weekly4' | 'weekly1'

export const HABIT_GROUPS: Record<string, { group: HabitGroup; label: string }> = {
  'Drink Water (1.5+ lt)': { group: 'daily', label: 'Aim for every day' },
  'Morning phone fasting (first 30+ min)': { group: 'daily', label: 'Aim for every day' },
  'Physical connection (pet or person)': { group: 'daily', label: 'Aim for every day' },
  'Hug someone': { group: 'daily', label: 'Aim for every day' },
  'Phone a friend / family': { group: 'daily', label: 'Aim for every day' },
  'Sunlight (10+ min)': { group: 'daily', label: 'Aim for every day' },
  'Eat Fruit & veg (8+ types)': { group: 'daily', label: 'Aim for every day' },
  'Sleep (7-9 hs)': { group: 'daily', label: 'Aim for every day' },
  'Walk (10k+ steps)': { group: 'daily', label: 'Aim for every day' },
  'No Ultra-processed food': { group: 'daily', label: 'Aim for every day' },
  'Meditation (10+ min)': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'Stretch (20+ min)': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'FIIT class (25-40 min)': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'Cold shower (1+ min)': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'Journaling / Reflection': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'No sugar': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'No alcohol': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'No smoking': { group: 'weekly4', label: 'Aim for 4+ times a week' },
  'Meet a friend / family': { group: 'weekly1', label: 'Aim for at least once a week' },
  'Walk in nature (30+ min)': { group: 'weekly1', label: 'Aim for at least once a week' },
  'Heat - Hot bath/Sauna': { group: 'weekly1', label: 'Aim for at least once a week' },
  'Act of kindness': { group: 'weekly1', label: 'Aim for at least once a week' },
}
