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

export function postProcessTranslation(text: string): string {
  let result = text;
  result = cleanWhitespace(result);
  result = fixPunctuation(result);
  result = fixCapitalization(result);
  return result;
}
