export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const codeBlockMultiplier = 0.5; // Code reads slower
  
  // Strip code blocks and count separately
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  
  const wordCount = contentWithoutCode.split(/\s+/).filter(w => w.length > 0).length;
  const codeWordCount = codeBlocks.join(' ').split(/\s+/).filter(w => w.length > 0).length;
  
  const readTime = (wordCount / wordsPerMinute) + (codeWordCount / wordsPerMinute * codeBlockMultiplier);
  return Math.max(1, Math.ceil(readTime));
}
