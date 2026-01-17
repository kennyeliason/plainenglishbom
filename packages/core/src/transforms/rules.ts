// Rule-based transformations for converting archaic English to plain English

interface TransformRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
}

// Pronoun replacements
const pronounRules: TransformRule[] = [
  // thee/thou/thy/thine -> you/your
  { pattern: /\bthee\b/gi, replacement: "you" },
  { pattern: /\bthou\b/gi, replacement: "you" },
  { pattern: /\bthy\b/gi, replacement: "your" },
  { pattern: /\bthine\b(?=\s+[aeiou])/gi, replacement: "your" },
  { pattern: /\bthine\b/gi, replacement: "your" },
  // ye -> you
  { pattern: /\bye\b/gi, replacement: "you" },
  // Reflexive
  { pattern: /\bthyself\b/gi, replacement: "yourself" },
];

// Verb transformations
const verbRules: TransformRule[] = [
  // hath -> has
  { pattern: /\bhath\b/gi, replacement: "has" },
  // doth -> does
  { pattern: /\bdoth\b/gi, replacement: "does" },
  // art (verb) -> are
  { pattern: /\bart\b(?!\s+(?:of|gallery|museum|class|work|form|style|piece))/gi, replacement: "are" },
  // wilt -> will
  { pattern: /\bwilt\b/gi, replacement: "will" },
  // shalt -> shall/will
  { pattern: /\bshalt\b/gi, replacement: "will" },
  // hast -> have
  { pattern: /\bhast\b/gi, replacement: "have" },
  // dost -> do
  { pattern: /\bdost\b/gi, replacement: "do" },
  // wouldst -> would
  { pattern: /\bwouldst\b/gi, replacement: "would" },
  // couldst -> could
  { pattern: /\bcouldst\b/gi, replacement: "could" },
  // shouldst -> should
  { pattern: /\bshouldst\b/gi, replacement: "should" },
  // canst -> can
  { pattern: /\bcanst\b/gi, replacement: "can" },
  // didst -> did
  { pattern: /\bdidst\b/gi, replacement: "did" },
  // knowest -> know
  { pattern: /\bknowest\b/gi, replacement: "know" },
  // sayest -> say
  { pattern: /\bsayest\b/gi, replacement: "say" },
  // doest -> do
  { pattern: /\bdoest\b/gi, replacement: "do" },
  // givest -> give
  { pattern: /\bgivest\b/gi, replacement: "give" },
  // makest -> make
  { pattern: /\bmakest\b/gi, replacement: "make" },
  // takest -> take
  { pattern: /\btakest\b/gi, replacement: "take" },
  // goest -> go
  { pattern: /\bgoest\b/gi, replacement: "go" },
  // comest -> come
  { pattern: /\bcomest\b/gi, replacement: "come" },
  // seest -> see
  { pattern: /\bseest\b/gi, replacement: "see" },
  // hearest -> hear
  { pattern: /\bhearest\b/gi, replacement: "hear" },
  // lovest -> love
  { pattern: /\blovest\b/gi, replacement: "love" },
  // believest -> believe
  { pattern: /\bbelievest\b/gi, replacement: "believe" },
];

// -eth verb ending transformations (third person singular)
const ethVerbRules: TransformRule[] = [
  // Common -eth verbs
  { pattern: /\bcometh\b/gi, replacement: "comes" },
  { pattern: /\bgoeth\b/gi, replacement: "goes" },
  { pattern: /\bsaith\b/gi, replacement: "says" },
  { pattern: /\bmaketh\b/gi, replacement: "makes" },
  { pattern: /\btaketh\b/gi, replacement: "takes" },
  { pattern: /\bgiveth\b/gi, replacement: "gives" },
  { pattern: /\bseeth\b/gi, replacement: "sees" },
  { pattern: /\bknoweth\b/gi, replacement: "knows" },
  { pattern: /\bloveth\b/gi, replacement: "loves" },
  { pattern: /\bliveth\b/gi, replacement: "lives" },
  { pattern: /\bdieth\b/gi, replacement: "dies" },
  { pattern: /\bbelieveth\b/gi, replacement: "believes" },
  { pattern: /\breceiveth\b/gi, replacement: "receives" },
  { pattern: /\bperceiveth\b/gi, replacement: "perceives" },
  { pattern: /\bbringeth\b/gi, replacement: "brings" },
  { pattern: /\bthinketh\b/gi, replacement: "thinks" },
  { pattern: /\bspeaketh\b/gi, replacement: "speaks" },
  { pattern: /\bworketh\b/gi, replacement: "works" },
  { pattern: /\bwalketh\b/gi, replacement: "walks" },
  { pattern: /\bstandeth\b/gi, replacement: "stands" },
  { pattern: /\bsitteth\b/gi, replacement: "sits" },
  { pattern: /\bleadeth\b/gi, replacement: "leads" },
  { pattern: /\bteacheth\b/gi, replacement: "teaches" },
  { pattern: /\breacheth\b/gi, replacement: "reaches" },
  { pattern: /\bpreacheth\b/gi, replacement: "preaches" },
  { pattern: /\bheareth\b/gi, replacement: "hears" },
  { pattern: /\bfeareth\b/gi, replacement: "fears" },
  { pattern: /\bappeareth\b/gi, replacement: "appears" },
  { pattern: /\bdwelleth\b/gi, replacement: "dwells" },
  { pattern: /\bfalleth\b/gi, replacement: "falls" },
  { pattern: /\bcalleth\b/gi, replacement: "calls" },
  { pattern: /\bfindeth\b/gi, replacement: "finds" },
  { pattern: /\bbindeth\b/gi, replacement: "binds" },
  { pattern: /\bholdeth\b/gi, replacement: "holds" },
  { pattern: /\btelleth\b/gi, replacement: "tells" },
  { pattern: /\bfilleth\b/gi, replacement: "fills" },
  { pattern: /\bkilleth\b/gi, replacement: "kills" },
  { pattern: /\breigneth\b/gi, replacement: "reigns" },
  { pattern: /\bremaineth\b/gi, replacement: "remains" },
  { pattern: /\bobtaineth\b/gi, replacement: "obtains" },
  { pattern: /\bcontaineth\b/gi, replacement: "contains" },
  { pattern: /\bsuffereth\b/gi, replacement: "suffers" },
  { pattern: /\boffereth\b/gi, replacement: "offers" },
  { pattern: /\banswereth\b/gi, replacement: "answers" },
  { pattern: /\bremembereth\b/gi, replacement: "remembers" },
  { pattern: /\bdesireth\b/gi, replacement: "desires" },
  { pattern: /\brequireth\b/gi, replacement: "requires" },
  { pattern: /\bexpireth\b/gi, replacement: "expires" },
  { pattern: /\bendureth\b/gi, replacement: "endures" },
  { pattern: /\bproceedeth\b/gi, replacement: "proceeds" },
  { pattern: /\bexceedeth\b/gi, replacement: "exceeds" },
  { pattern: /\bneedeth\b/gi, replacement: "needs" },
  { pattern: /\bpasseth\b/gi, replacement: "passes" },
  { pattern: /\bpossesseth\b/gi, replacement: "possesses" },
  { pattern: /\bblesseth\b/gi, replacement: "blesses" },
  { pattern: /\bconfesseth\b/gi, replacement: "confesses" },
  { pattern: /\btestifieth\b/gi, replacement: "testifies" },
  { pattern: /\bglorifieth\b/gi, replacement: "glorifies" },
  { pattern: /\bsanctifieth\b/gi, replacement: "sanctifies" },
  { pattern: /\bjustifieth\b/gi, replacement: "justifies" },
  { pattern: /\bsignifieth\b/gi, replacement: "signifies" },
  { pattern: /\bprophesieth\b/gi, replacement: "prophesies" },
  { pattern: /\bdestroyeth\b/gi, replacement: "destroys" },
  { pattern: /\bemployeth\b/gi, replacement: "employs" },
  { pattern: /\benjoyeth\b/gi, replacement: "enjoys" },
  // Generic -eth to -s/es (fallback for uncommon verbs)
  { pattern: /\b(\w+)ieth\b/gi, replacement: (_, base) => `${base}ies` },
  { pattern: /\b(\w+)eth\b/gi, replacement: (_, base) => `${base}s` },
];

// Archaic words and phrases
const archaicWordRules: TransformRule[] = [
  // Common archaic words
  { pattern: /\bwherefore\b/gi, replacement: "therefore" },
  { pattern: /\bbehold\b/gi, replacement: "see" },
  { pattern: /\byea\b/gi, replacement: "yes" },
  { pattern: /\bnay\b/gi, replacement: "no" },
  { pattern: /\bverily\b/gi, replacement: "truly" },
  { pattern: /\bhitherto\b/gi, replacement: "until now" },
  { pattern: /\bhenceforth\b/gi, replacement: "from now on" },
  { pattern: /\bwhence\b/gi, replacement: "from where" },
  { pattern: /\bthence\b/gi, replacement: "from there" },
  { pattern: /\bhither\b/gi, replacement: "here" },
  { pattern: /\bthither\b/gi, replacement: "there" },
  { pattern: /\bwhither\b/gi, replacement: "where" },
  { pattern: /\bherein\b/gi, replacement: "in this" },
  { pattern: /\btherein\b/gi, replacement: "in that" },
  { pattern: /\bwherein\b/gi, replacement: "in which" },
  { pattern: /\bhereof\b/gi, replacement: "of this" },
  { pattern: /\bthereof\b/gi, replacement: "of that" },
  { pattern: /\bwhereof\b/gi, replacement: "of which" },
  { pattern: /\bhereto\b/gi, replacement: "to this" },
  { pattern: /\bthereto\b/gi, replacement: "to that" },
  { pattern: /\bhereby\b/gi, replacement: "by this" },
  { pattern: /\bthereby\b/gi, replacement: "by that" },
  { pattern: /\bwhereby\b/gi, replacement: "by which" },
  { pattern: /\bherewith\b/gi, replacement: "with this" },
  { pattern: /\btherewith\b/gi, replacement: "with that" },
  { pattern: /\bunto\b/gi, replacement: "to" },
  { pattern: /\bwhereupon\b/gi, replacement: "after which" },
  { pattern: /\bthereupon\b/gi, replacement: "after that" },
  { pattern: /\bnotwithstanding\b/gi, replacement: "despite" },
  { pattern: /\bforthwith\b/gi, replacement: "immediately" },
  { pattern: /\bstraightway\b/gi, replacement: "immediately" },
  { pattern: /\bsundry\b/gi, replacement: "various" },
  { pattern: /\bdivers\b/gi, replacement: "various" },
  { pattern: /\bmultitude\b/gi, replacement: "crowd" },
  { pattern: /\bbegat\b/gi, replacement: "fathered" },
  { pattern: /\bbegotten\b/gi, replacement: "fathered" },
  { pattern: /\bbrethren\b/gi, replacement: "brothers" },
  { pattern: /\bkindred\b/gi, replacement: "relatives" },
  { pattern: /\bbidden\b/gi, replacement: "told" },
  { pattern: /\bbade\b/gi, replacement: "told" },
  { pattern: /\bwist\b/gi, replacement: "knew" },
  { pattern: /\bspake\b/gi, replacement: "spoke" },
  { pattern: /\bsake\b/gi, replacement: "behalf" },
  { pattern: /\bshew\b/gi, replacement: "show" },
  { pattern: /\bshewn\b/gi, replacement: "shown" },
  { pattern: /\bshewed\b/gi, replacement: "showed" },
  { pattern: /\bsheweth\b/gi, replacement: "shows" },
  { pattern: /\bsuffered\b/gi, replacement: "allowed" },
  { pattern: /\bsuffer\b/gi, replacement: "allow" },
  { pattern: /\bwaxed\b/gi, replacement: "grew" },
  { pattern: /\bwax\b/gi, replacement: "grow" },
  { pattern: /\babode\b/gi, replacement: "stayed" },
  { pattern: /\babideth\b/gi, replacement: "stays" },
  { pattern: /\bsore\b(?!\s+(?:ankle|foot|throat|back|head|eye|arm|leg|muscle))/gi, replacement: "great" },
  { pattern: /\bsmote\b/gi, replacement: "struck" },
  { pattern: /\bslew\b/gi, replacement: "killed" },
  { pattern: /\bslain\b/gi, replacement: "killed" },
  { pattern: /\bwroth\b/gi, replacement: "angry" },
  { pattern: /\bperadventure\b/gi, replacement: "perhaps" },
  { pattern: /\bhaply\b/gi, replacement: "perhaps" },
  { pattern: /\bmayhap\b/gi, replacement: "perhaps" },
  { pattern: /\bwithout\b(?=\s+the\s+(?:city|gate|camp|wall))/gi, replacement: "outside" },
  { pattern: /\bwithin\b(?=\s+the\s+(?:city|gate|camp|wall))/gi, replacement: "inside" },
  { pattern: /\bafore\b/gi, replacement: "before" },
  { pattern: /\bere\b/gi, replacement: "before" },
  { pattern: /\blest\b/gi, replacement: "so that not" },
  { pattern: /\bsaviour\b/gi, replacement: "Savior" },
  { pattern: /\bbehaviour\b/gi, replacement: "behavior" },
  { pattern: /\bfavour\b/gi, replacement: "favor" },
  { pattern: /\bhonour\b/gi, replacement: "honor" },
  { pattern: /\blabour\b/gi, replacement: "labor" },
  { pattern: /\bneighbour\b/gi, replacement: "neighbor" },
];

// Phrase-level transformations
const phraseRules: TransformRule[] = [
  // "it came to pass" variations
  { pattern: /\band it came to pass that\b/gi, replacement: "and" },
  { pattern: /\bit came to pass that\b/gi, replacement: "" },
  { pattern: /\bit came to pass,?\s*/gi, replacement: "" },
  // "inasmuch as" -> "because" or "since"
  { pattern: /\binasmuch as\b/gi, replacement: "since" },
  // "insomuch that" -> "so much that"
  { pattern: /\binsomuch that\b/gi, replacement: "so much that" },
  // "even so" -> "likewise" or remove
  { pattern: /\b,?\s*even so\b/gi, replacement: "" },
  // "and thus" -> "and so"
  { pattern: /\band thus\b/gi, replacement: "and so" },
  // "of a surety" -> "certainly"
  { pattern: /\bof a surety\b/gi, replacement: "certainly" },
  // "with one accord" -> "together"
  { pattern: /\bwith one accord\b/gi, replacement: "together" },
  // "from this time forth" -> "from now on"
  { pattern: /\bfrom this time forth\b/gi, replacement: "from now on" },
  // "after this manner" -> "in this way"
  { pattern: /\bafter this manner\b/gi, replacement: "in this way" },
  // "according to" is fine, keep it
  // "exceedingly" -> "very" or "greatly"
  { pattern: /\bexceedingly\b/gi, replacement: "very" },
  // Double negatives (for emphasis in archaic English)
  // "wo unto" -> "woe to"
  { pattern: /\bwo\s+unto\b/gi, replacement: "woe to" },
  // "save it be" -> "unless"
  { pattern: /\bsave it be\b/gi, replacement: "unless" },
  // "save it were" -> "except"
  { pattern: /\bsave it were\b/gi, replacement: "except" },
  // "save only" -> "except"
  { pattern: /\bsave only\b/gi, replacement: "except for" },
  // "save" (meaning except) - careful with context
  { pattern: /\b,?\s*save\s+(?=that|those|this|the|they|he|she|it|we|I)/gi, replacement: " except " },
];

// Combine all rules in order of application
export const allRules: TransformRule[] = [
  ...phraseRules,      // Apply phrase rules first
  ...pronounRules,
  ...verbRules,
  ...ethVerbRules,
  ...archaicWordRules,
];

// Apply all transformations to a text
export function applyRuleBasedTransform(text: string): string {
  let result = text;

  for (const rule of allRules) {
    if (typeof rule.replacement === "string") {
      result = result.replace(rule.pattern, rule.replacement);
    } else {
      result = result.replace(rule.pattern, rule.replacement as (...args: string[]) => string);
    }
  }

  // Clean up extra spaces
  result = result.replace(/\s+/g, " ").trim();
  // Fix capitalization after sentence starters that were removed
  result = result.replace(/^\s*([a-z])/g, (_, char) => char.toUpperCase());
  result = result.replace(/\.\s+([a-z])/g, (_, char) => `. ${char.toUpperCase()}`);

  return result;
}

// Test function
export function testTransform(original: string): { original: string; transformed: string } {
  return {
    original,
    transformed: applyRuleBasedTransform(original),
  };
}
