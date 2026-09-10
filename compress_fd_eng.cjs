const fs = require('fs');

const replacements = {
  "FD-ENG-001": {
    j: "Good morning",
    p: ["Good night", "Goodbye", "See you later"]
  },
  "FD-ENG-002": {
    j: "am",
    p: ["is", "are", "was"]
  },
  "FD-ENG-003": {
    j: "goes",
    p: ["go", "going", "went"]
  },
  "FD-ENG-004": {
    j: "Her",
    p: ["His", "My", "Your"]
  },
  "FD-ENG-005": {
    j: "under",
    p: ["on", "above", "in front of"]
  },
  "FD-ENG-006": {
    j: "The writer's pet rabbit",
    p: [
      "How to feed a rabbit",
      "The physical appearance of a rabbit",
      "Playing in the backyard"
    ]
  },
  "FD-ENG-007": {
    j: "Carrots and fresh vegetables",
    p: [
      "Fruits and meat",
      "Carrots and fish",
      "Fresh vegetables and grass"
    ]
  },
  "FD-ENG-008": {
    j: "patient and creative",
    p: ["strict and discipline", "lazy and boring", "quiet and angry"]
  },
  "FD-ENG-009": {
    j: "We must not make noise in the library.",
    p: [
      "We are allowed to talk loudly.",
      "We must speak softly to the librarian only.",
      "We must not read books loudly outside."
    ]
  },
  "FD-ENG-010": {
    j: "a quarter past six",
    p: ["a quarter to six", "half past six", "six o'clock"]
  },
  "FD-ENG-011": {
    j: "What do you think",
    p: ["Do you agree", "Are you sure", "How are you"]
  },
  "FD-ENG-012": {
    j: "I completely agree with you.",
    p: [
      "I don't think so.",
      "I disagree with you.",
      "I am not sure about that."
    ]
  },
  "FD-ENG-013": {
    j: "uncle",
    p: ["aunt", "grandfather", "nephew"]
  },
  "FD-ENG-014": {
    j: "is sleeping",
    p: ["sleeps", "slept", "was sleeping"]
  },
  "FD-ENG-015": {
    j: "did",
    p: ["do", "does", "were"]
  },
  "FD-ENG-016": {
    j: "Holiday experience at the zoo despite rain.",
    p: [
      "The animals seen at the zoo.",
      "How to take shelter from heavy rain.",
      "The writer's sadness because of rain."
    ]
  },
  "FD-ENG-017": {
    j: "Because it rained heavily.",
    p: [
      "Because they wanted to see monkeys.",
      "Because the animals chased them.",
      "Because they felt very tired."
    ]
  },
  "FD-ENG-018": {
    j: "very tired",
    p: ["very happy", "very hungry", "very thirsty"]
  },
  "FD-ENG-019": {
    j: "mangoes",
    p: ["mango", "mangos", "mango's"]
  },
  "FD-ENG-020": {
    j: "heavier",
    p: ["lighter", "more heavy", "most heavy"]
  },
  "FD-ENG-021": {
    j: "highest",
    p: ["higher", "most high", "more high"]
  },
  "FD-ENG-022": {
    j: "We must prepare for the future, not be lazy.",
    p: [
      "We must play every day during summer.",
      "We should laugh at friends who work hard.",
      "Winter is the best time to look for food."
    ]
  },
  "FD-ENG-023": {
    j: "Wait for 3 minutes.",
    p: [
      "Put a teabag into the cup.",
      "Add some sugar and stir well.",
      "Boil some water."
    ]
  },
  "FD-ENG-024": {
    j: "I'd love to.",
    p: [
      "I am sorry, I can't.",
      "I don't think so.",
      "No, thank you."
    ]
  },
  "FD-ENG-025": {
    j: "Excuse me",
    p: ["I am sorry", "Thank you", "Good morning"]
  },
  "FD-ENG-026": {
    j: "Students joining the English Club.",
    p: [
      "All students in the school.",
      "The teachers of the English Club.",
      "The committee of the school anniversary."
    ]
  },
  "FD-ENG-027": {
    j: "Before Friday.",
    p: [
      "Next week.",
      "On Friday.",
      "During the school anniversary."
    ]
  },
  "FD-ENG-028": {
    j: "doctor",
    p: ["teacher", "farmer", "mechanic"]
  },
  "FD-ENG-029": {
    j: "That's alright.",
    p: [
      "Thank you very much.",
      "You are welcome.",
      "I agree with you."
    ]
  },
  "FD-ENG-030": {
    j: "She will cancel swimming.",
    p: [
      "She will swim in the rain.",
      "She will make a chocolate cake.",
      "She will ask Sita to go swimming."
    ]
  }
};

let content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
let modifiedCount = 0;

for (let id in replacements) {
    const rep = replacements[id];
    
    const idIdx = content.indexOf(`"id": "${id}"`);
    if (idIdx === -1) {
        console.log("Could not find", id);
        continue;
    }
    
    const jbMatch = /"jawabanBenar":\s*"(.*?)"(,\s*"pengecoh")/s.exec(content.substring(idIdx));
    if (jbMatch) {
        const oldJb = `"jawabanBenar": "${jbMatch[1]}"`;
        const newJ = rep.j.replace(/"/g, '\\"');
        const newJb = `"jawabanBenar": "${newJ}"`;
        content = content.replace(oldJb, newJb);
    } else {
        console.log("Could not find jawabanBenar for", id);
    }
    
    const idIdx2 = content.indexOf(`"id": "${id}"`);
    const pMatch = /"pengecoh":\s*\[(.*?)\]/s.exec(content.substring(idIdx2));
    if (pMatch) {
        const oldP = `"pengecoh": [${pMatch[1]}]`;
        const newPengecohArray = rep.p.map(x => `\n      "${x.replace(/"/g, '\\"')}"`).join(',') + '\n    ';
        const newP = `"pengecoh": [${newPengecohArray}]`;
        content = content.replace(oldP, newP);
    } else {
        console.log("Could not find pengecoh for", id);
    }
    
    modifiedCount++;
}

fs.writeFileSync('src/engine/EducationalEngine.ts', content);
console.log('Modified', modifiedCount, 'items.');
