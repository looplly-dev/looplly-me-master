import { documentationIndex, DocumentationItem } from '@/data/documentationIndex';

export function findRelatedDocuments(docId: string, limit: number = 5): DocumentationItem[] {
  const currentDoc = documentationIndex.find(doc => doc.id === docId);
  if (!currentDoc) return [];

  const otherDocs = documentationIndex.filter(doc => doc.id !== docId && doc.status === 'published');

  const scoredDocs = otherDocs.map(doc => {
    let score = 0;

    // Same category (high weight)
    if (doc.category === currentDoc.category) score += 10;

    // Shared tags (medium weight)
    const sharedTags = doc.tags.filter(tag => currentDoc.tags.includes(tag));
    score += sharedTags.length * 3;

    // Manual related docs (highest weight)
    if ((currentDoc as any).relatedDocs?.includes(doc.id)) score += 20;

    return { doc, score };
  });

  return scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.doc);
}
