// ─────────────────────────────────────────────────────────────
// IN BLOOM — Emotional Intelligence content
//
// ALL the wording for the EI tab lives in this one file.
// To add or change an activity, edit the PRACTICES list below.
// To change a self-assessment statement, edit COMPETENCIES.
// Nothing else in the app needs to change.
//
// Built from the literature summary for the work-based project
// (Goleman, Boyatzis and McKee; Boyatzis; Bradberry and Greaves;
// David; Brackett; Covey; Grandey; Humphrey et al.; De Wit et al.;
// Schlegel et al.; Saundry et al.).
// ─────────────────────────────────────────────────────────────

export type DomainKey = 'selfAwareness' | 'selfManagement' | 'socialAwareness' | 'relationshipManagement'

export interface Domain {
  key: DomainKey
  label: string
  part: 'Managing self' | 'Managing conflict with others'
  description: string
}

// Four domains from Primal Leadership, grouped into the project's two-part framework
export const DOMAINS: Domain[] = [
  { key: 'selfAwareness', label: 'Self-awareness', part: 'Managing self', description: 'Knowing what you feel, why, and how it lands on other people.' },
  { key: 'selfManagement', label: 'Self-management', part: 'Managing self', description: 'Choosing your response instead of being driven by the feeling.' },
  { key: 'socialAwareness', label: 'Social awareness', part: 'Managing conflict with others', description: 'Reading what other people feel and what is going on in the room.' },
  { key: 'relationshipManagement', label: 'Relationship management', part: 'Managing conflict with others', description: 'Using all of the above to handle disagreement early and well.' },
]

export interface Competency {
  key: string
  domain: DomainKey
  label: string
  // Plain-language statement to rate yourself against (1 = rarely, 5 = almost always)
  statement: string
}

export const COMPETENCIES: Competency[] = [
  { key: 'emotionalSelfAwareness', domain: 'selfAwareness', label: 'Emotional self-awareness', statement: 'I can name what I am feeling precisely, while I am feeling it.' },
  { key: 'knowingMyImpact', domain: 'selfAwareness', label: 'Knowing my impact', statement: 'I know how my mood and tone affect the people around me.' },
  { key: 'accurateSelfView', domain: 'selfAwareness', label: 'Accurate self-view', statement: 'I know my strengths and limits, and I ask for feedback to check them.' },
  { key: 'emotionalSelfControl', domain: 'selfManagement', label: 'Emotional self-control', statement: 'When something triggers me, I pause before I respond rather than escalate.' },
  { key: 'adaptability', domain: 'selfManagement', label: 'Adaptability', statement: 'I adjust my approach when the situation changes, without getting stuck on how it should have gone.' },
  { key: 'motivation', domain: 'selfManagement', label: 'Motivation and positive outlook', statement: 'I stay focused on solving the problem, even after a setback.' },
  { key: 'empathy', domain: 'socialAwareness', label: 'Empathy', statement: 'I listen to understand how the other person sees it before I give my view.' },
  { key: 'readingTheRoom', domain: 'socialAwareness', label: 'Reading the room', statement: 'I notice tension in a team or between departments early, before anyone raises it.' },
  { key: 'conflictManagement', domain: 'relationshipManagement', label: 'Conflict management', statement: 'I raise disagreements early and informally, and look for a solution that works for both sides.' },
  { key: 'warmAndCompetent', domain: 'relationshipManagement', label: 'Warm and capable', statement: 'In a difficult conversation I come across as both caring and clear about what needs to happen.' },
  { key: 'settingTheTone', domain: 'relationshipManagement', label: 'Setting the tone', statement: 'I deliberately bring the emotional tone the team needs, such as calm in a tense moment.' },
  { key: 'buildingTrust', domain: 'relationshipManagement', label: 'Building trust', statement: 'I explain my decisions, keep my promises and take feedback without getting defensive.' },
]

export interface Practice {
  id: string
  competency: string // key from COMPETENCIES
  title: string
  minutes: number
  how: string
  why: string
  source: string
}

export const PRACTICES: Practice[] = [
  // ── Self-awareness ──
  { id: 'name-it-precisely', competency: 'emotionalSelfAwareness', title: 'Name it precisely', minutes: 2,
    how: 'When you notice a strong feeling, find the exact word. Not "angry" but disappointed, embarrassed, overlooked or let down. Say it to yourself or write it in a check-in.',
    why: 'A precise label turns the feeling into information you can use, and makes it easier to choose what to do next.',
    source: 'David (2016); Brackett (2019)' },
  { id: 'emotion-scientist', competency: 'emotionalSelfAwareness', title: 'Emotion scientist, not judge', minutes: 3,
    how: 'Pick one feeling from today and ask three curious questions: What set it off? What was it telling me? What did it make me want to do? No verdict on whether you should have felt it.',
    why: 'Curiosity keeps you open to the feeling long enough to learn from it; judging it shuts that down.',
    source: 'Brackett (2019)' },
  { id: 'lean-into-discomfort', competency: 'emotionalSelfAwareness', title: 'Stay with the discomfort', minutes: 3,
    how: 'Next time an uncomfortable feeling arrives, do not distract yourself. Stay with it for a minute and notice where it sits in your body and what thought comes with it.',
    why: 'Feelings you avoid keep steering you from the background. Looking at them directly is where self-awareness starts.',
    source: 'Bradberry and Greaves (2009)' },
  { id: 'ripple-check', competency: 'knowingMyImpact', title: 'Ripple check', minutes: 2,
    how: 'Before you walk into a meeting or onto the floor, ask: what mood am I carrying in, and what will it do to the people in there?',
    why: 'A leader\'s mood spreads to the team, so yours sets the climate whether you intend it or not.',
    source: 'Goleman, Boyatzis and McKee (2013)' },
  { id: 'ask-how-it-landed', competency: 'knowingMyImpact', title: 'Ask how it landed', minutes: 5,
    how: 'After a conversation that mattered, ask someone you trust: "How did I come across in there?" Listen, thank them, and do not explain yourself.',
    why: 'How you come across is the "real self" other people see. You can only learn it from them.',
    source: 'Boyatzis (2006)' },
  { id: 'ideal-self', competency: 'accurateSelfView', title: 'Picture your ideal self', minutes: 10,
    how: 'Write a few lines on the leader you want to be in three years: how people feel after dealing with you, and how you handle a hard day. Add it to your monthly self-assessment.',
    why: 'Change that lasts starts from a picture of who you want to be, not from a list of weaknesses.',
    source: 'Boyatzis (2006)' },
  { id: 'strength-and-gap', competency: 'accurateSelfView', title: 'One strength, one gap', minutes: 5,
    how: 'Look at your latest self-assessment or 360. Choose one strength to build on and one gap to close. Write one small thing you will try this week for each.',
    why: 'A learning plan that builds on strengths is one people keep to; a plan made only of faults is not.',
    source: 'Boyatzis (2006)' },

  // ── Self-management ──
  { id: 'meta-moment', competency: 'emotionalSelfControl', title: 'The pause', minutes: 1,
    how: 'When you feel triggered: stop, take one slow breath, and picture yourself at your best. Ask what that version of you would do next. Then respond.',
    why: 'The gap between the trigger and your response is where you get to choose. Even a few seconds is enough.',
    source: 'Brackett (2019)' },
  { id: 'breathe-count', competency: 'emotionalSelfControl', title: 'Breathe and count to ten', minutes: 1,
    how: 'Breathe in slowly through your nose, out through your mouth, and count each out-breath up to ten before you speak or reply to the message.',
    why: 'Slow breathing settles the body\'s alarm response so the thinking part of you can catch up.',
    source: 'Bradberry and Greaves (2009)' },
  { id: 'sleep-on-it', competency: 'emotionalSelfControl', title: 'Sleep on it', minutes: 1,
    how: 'If a decision or reply is charged and not urgent, write the draft, do not send it, and look again tomorrow morning.',
    why: 'Time lowers the intensity of the feeling, so what you send reflects your judgement and not the heat of the moment.',
    source: 'Bradberry and Greaves (2009)' },
  { id: 'step-out', competency: 'emotionalSelfControl', title: 'Step out of the thought', minutes: 2,
    how: 'When a thought has hooked you ("they never listen"), restate it as: "I am having the thought that they never listen." Notice the distance that opens up.',
    why: 'Thoughts and feelings are information, not instructions. Seeing them as thoughts loosens their grip.',
    source: 'David (2016)' },
  { id: 'reappraise', competency: 'adaptability', title: 'Find another reading', minutes: 3,
    how: 'For a situation that annoyed you, write two other explanations for what the person did that have nothing to do with you. Pick the most likely one.',
    why: 'Changing how you read the situation changes what you feel. Hiding the feeling behind a calm face does not, and it wears you out.',
    source: 'Grandey (2000)' },
  { id: 'circle-of-influence', competency: 'adaptability', title: 'Circle of influence', minutes: 5,
    how: 'List what is bothering you about a situation. Mark each item as "I can act on this" or "I cannot". Choose one action from the first group and drop the rest for today.',
    why: 'Effort spent on what you can change grows your influence; effort spent on the rest only grows frustration.',
    source: 'Covey (2020)' },
  { id: 'walk-your-why', competency: 'motivation', title: 'Walk your why', minutes: 3,
    how: 'Before a difficult conversation, write down the one value you want to act from (fairness, respect, honesty). Afterwards, check whether you did.',
    why: 'Values work as a compass when emotions pull in different directions.',
    source: 'David (2016)' },
  { id: 'tiny-tweak', competency: 'motivation', title: 'One tiny tweak', minutes: 2,
    how: 'Pick one very small change to try for a week, such as asking one question before giving your opinion. Log it each time you do it.',
    why: 'New behaviours become habits through small experiments repeated, not through big resolutions.',
    source: 'David (2016); Boyatzis (2006)' },

  // ── Social awareness ──
  { id: 'listen-to-understand', competency: 'empathy', title: 'Listen to understand', minutes: 10,
    how: 'In one conversation today, do not prepare your reply while the other person talks. When they finish, say back what you heard and how they seem to feel, and ask if you got it right.',
    why: 'People only move to solving a problem once they feel understood.',
    source: 'Covey (2020)' },
  { id: 'watch-body-language', competency: 'empathy', title: 'Watch the body language', minutes: 5,
    how: 'In your next meeting, spend five minutes watching one person\'s face, posture and tone instead of their words. What are they feeling that they have not said?',
    why: 'Recognising emotion in other people is the first step; everything else in handling conflict rests on it.',
    source: 'Bradberry and Greaves (2009); Mayer and Salovey (1997)' },
  { id: 'their-side-first', competency: 'empathy', title: 'Write their side first', minutes: 5,
    how: 'Before raising an issue with another department, write three sentences describing the situation as they would describe it, including the pressures they are under.',
    why: 'Taking the other side\'s view into account makes a joint solution far more likely than a win-lose argument.',
    source: 'Goleman (1995); Rahim et al. (2002)' },
  { id: 'temperature-check', competency: 'readingTheRoom', title: 'Temperature check', minutes: 3,
    how: 'At the start of a meeting or shift, scan the group: who is quiet, who is tense, who is avoiding whom? Note one thing you would otherwise have missed.',
    why: 'Teams have a shared emotional climate. Tension you spot early can be dealt with in a conversation instead of a procedure.',
    source: 'Ayoko, Callan and Härtel (2008)' },
  { id: 'name-the-conflict-type', competency: 'readingTheRoom', title: 'Which kind of conflict is this?', minutes: 3,
    how: 'For a disagreement you have seen this week, decide: is it about the work itself (task), about who does what and how (process), or has it become personal (relationship)?',
    why: 'Disagreement about the work can be useful. Friction over roles and handovers, and anything personal, does damage and needs dealing with early.',
    source: 'De Wit, Greer and Jehn (2012)' },

  // ── Relationship management ──
  { id: 'early-conversation', competency: 'conflictManagement', title: 'The early conversation', minutes: 15,
    how: 'Pick one small issue you have been putting off. Raise it today, informally and in private: what you noticed, the effect it had, and a question about how they see it.',
    why: 'Conflict handled by an early informal conversation costs far less, in money and in relationships, than conflict that goes formal.',
    source: 'Saundry and Urwin (2021); CIPD (2020)' },
  { id: 'think-win-win', competency: 'conflictManagement', title: 'Look for the win-win', minutes: 5,
    how: 'Before a negotiation or disagreement, write down what you need, what they need, and one option that would give both sides most of it.',
    why: 'Problem solving, where both sides\' concerns are met, is the conflict style most consistently linked to emotional intelligence.',
    source: 'Covey (2020); Rahim et al. (2002)' },
  { id: 'what-makes-it-hard', competency: 'conflictManagement', title: 'What makes it hard to raise?', minutes: 5,
    how: 'For an issue you are avoiding, finish the sentence: "I have not raised this because I am afraid that…". Then write what is most likely to happen if you do.',
    why: 'Managers mostly avoid early conversations out of fear for the relationship or their standing. Naming the fear usually shrinks it.',
    source: 'Saundry et al. (2016)' },
  { id: 'warm-and-clear', competency: 'warmAndCompetent', title: 'Warm and clear', minutes: 5,
    how: 'Plan a difficult conversation with two lines: one that shows you care about the person, and one that states plainly what needs to change. Use both.',
    why: 'Managers handle conflict well when they come across as caring and capable together, not one at the cost of the other.',
    source: 'Schlegel, de Jong and Boros (2025)' },
  { id: 'choose-the-display', competency: 'settingTheTone', title: 'Choose what you show', minutes: 2,
    how: 'Before a tense moment, decide what the team needs from you (calm, energy, concern) and find a real reason to feel it, instead of putting on a face.',
    why: 'Leaders shape their team\'s mood through what they display. Working your way to the real feeling is more convincing and less tiring than faking it.',
    source: 'Humphrey, Pollack and Hawver (2008); Grandey (2000)' },
  { id: 'explain-your-decision', competency: 'buildingTrust', title: 'Explain your decision', minutes: 5,
    how: 'For one decision today, tell the people affected why you made it, what else you considered and what it means for them.',
    why: 'People accept decisions they understand far more readily, even ones they dislike.',
    source: 'Bradberry and Greaves (2009)' },
  { id: 'emotional-bank-account', competency: 'buildingTrust', title: 'Make a deposit', minutes: 5,
    how: 'Do one thing today that builds trust with someone you may later need to disagree with: keep a small promise, give credit, or say sorry for something.',
    why: 'Trust built in ordinary moments is what you draw on when a conversation gets hard.',
    source: 'Covey (2020)' },
  { id: 'take-feedback-well', competency: 'buildingTrust', title: 'Take feedback well', minutes: 5,
    how: 'Ask one person for one thing you could do better. Say thank you, ask a question to understand it, and resist defending yourself.',
    why: 'Change happens through trusting relationships with people who tell you the truth.',
    source: 'Bradberry and Greaves (2009); Boyatzis (2006)' },
]

// ── Emotion check-in: feelings grouped by energy and pleasantness ──
export interface Quadrant {
  key: string
  label: string
  hint: string
  color: string
  emotions: string[]
}

export const QUADRANTS: Quadrant[] = [
  { key: 'highUnpleasant', label: 'High energy · unpleasant', hint: 'Stirred up', color: '#b5503c',
    emotions: ['Frustrated', 'Irritated', 'Angry', 'Anxious', 'Worried', 'Stressed', 'Overwhelmed', 'Defensive', 'Embarrassed', 'Resentful', 'Impatient', 'Let down'] },
  { key: 'highPleasant', label: 'High energy · pleasant', hint: 'Lit up', color: '#c9963a',
    emotions: ['Energised', 'Excited', 'Proud', 'Hopeful', 'Inspired', 'Confident', 'Motivated', 'Joyful', 'Curious', 'Determined', 'Optimistic', 'Appreciated'] },
  { key: 'lowUnpleasant', label: 'Low energy · unpleasant', hint: 'Weighed down', color: '#46648c',
    emotions: ['Tired', 'Drained', 'Disappointed', 'Sad', 'Discouraged', 'Lonely', 'Overlooked', 'Bored', 'Guilty', 'Hurt', 'Flat', 'Helpless'] },
  { key: 'lowPleasant', label: 'Low energy · pleasant', hint: 'Settled', color: '#6b7c5c',
    emotions: ['Calm', 'Content', 'Relieved', 'Grateful', 'At ease', 'Satisfied', 'Peaceful', 'Thoughtful', 'Secure', 'Rested', 'Connected', 'Balanced'] },
]

export const REACTIONS = [
  { key: 'paused', label: 'I paused first' },
  { key: 'reacted', label: 'I reacted straight away' },
  { key: 'held', label: 'I held it in' },
  { key: 'none', label: 'Nothing to respond to' },
]

export const competencyByKey = (key: string) => COMPETENCIES.find(c => c.key === key)
export const practiceById = (id: string) => PRACTICES.find(p => p.id === id)
export const domainByKey = (key: string) => DOMAINS.find(d => d.key === key)
