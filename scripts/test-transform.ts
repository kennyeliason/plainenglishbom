import { testTransform } from "../src/lib/transform-rules";

// Sample verses from the Book of Mormon
const testVerses = [
  "I, Nephi, having been born of goodly parents, therefore I was taught somewhat in all the learning of my father; and having seen many afflictions in the course of my days, nevertheless, having been highly favored of the Lord in all my days; yea, having had a great knowledge of the goodness and the mysteries of God, therefore I make a record of my proceedings in my days.",

  "And it came to pass that the Lord spake unto my father, yea, even in a dream, and said unto him: Blessed art thou Lehi, because of the things which thou hast done; and because thou hast been faithful and declared unto this people the things which I commanded thee, behold, they seek to take away thy life.",

  "Wherefore, the Lord hath commanded me that thou and thy brethren shall go unto the house of Laban, and seek the records, and bring them down hither into the wilderness.",

  "And behold, I say unto you that inasmuch as ye shall keep the commandments of God ye shall prosper in the land; and inasmuch as ye will not keep the commandments of God ye shall be cut off from his presence.",

  "And it came to pass that he spake unto them, saying: Behold, I have dreamed a dream; or, in other words, I have seen a vision.",

  "For it came to pass in the commencement of the first year of the reign of Zedekiah, king of Judah, (my father, Lehi, having dwelt at Jerusalem in all his days); and in that same year there came many prophets, prophesying unto the people that they must repent, or the great city Jerusalem must be destroyed.",
];

console.log("=== Testing Transformation Rules ===\n");

for (let i = 0; i < testVerses.length; i++) {
  const result = testTransform(testVerses[i]!);
  console.log(`--- Verse ${i + 1} ---`);
  console.log(`ORIGINAL:\n${result.original}\n`);
  console.log(`TRANSFORMED:\n${result.transformed}\n`);
  console.log("");
}
