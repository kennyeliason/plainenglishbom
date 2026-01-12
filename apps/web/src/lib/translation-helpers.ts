export function cleanWhitespace(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/([.,!?;:])\s+/g, "$1 ")
    .trim();
}

export function fixPunctuation(text: string): string {
  return text
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/([.,!?;:])([^\s])/g, "$1 $2")
    .trim();
}

export function fixCapitalization(text: string): string {
  let result = text.trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  result = result.replace(/([.!?])\s+([a-z])/g, (match, punc, letter) => {
    return `${punc} ${letter.toUpperCase()}`;
  });
  return result;
}

export function normalizeQuotes(text: string): string {
  let result = text;

  // Convert all quote variants to straight quotes first for consistency
  // Opening curly double quotes
  result = result.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  // Opening curly single quotes and apostrophes
  result = result.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // Remove space before closing quotes
  result = result.replace(/\s+"/g, '"');
  result = result.replace(/\s+'/g, "'");

  // Remove double quotes (e.g., "" or '')
  result = result.replace(/""+/g, '"');
  result = result.replace(/''+/g, "'");

  // Fix quote after punctuation that should close (e.g., `." "` -> `."`)
  result = result.replace(/([.!?])\s*"\s*"/g, '$1"');

  // Convert to smart/curly quotes for better typography
  // Opening quotes (after space, start of string, or opening paren/bracket)
  result = result.replace(/(^|[\s(\[])"([^\s])/g, '$1"$2');
  result = result.replace(/(^|[\s(\[])'([^\s])/g, "$1'$2");

  // Closing quotes (before space, end of string, punctuation, or closing paren/bracket)
  result = result.replace(/([^\s])"([\s.,!?;:\])]|$)/g, '$1"$2');
  result = result.replace(/([^\s])'([\s.,!?;:\])]|$)/g, "$1'$2");

  // Handle apostrophes in contractions (e.g., don't, it's)
  result = result.replace(/(\w)'(\w)/g, "$1'$2");

  return result;
}

export function postProcessTranslation(text: string): string {
  let result = text;
  result = cleanWhitespace(result);
  result = fixPunctuation(result);
  result = normalizeQuotes(result);
  result = fixCapitalization(result);
  return result;
}
