export interface MergeConflictBlock {
  id: string;
  startLine: number; // 1-indexed (<<<<<<< line)
  splitterLine: number; // 1-indexed (======= line)
  endLine: number; // 1-indexed (>>>>>>> line)
  currentHeader: string; // e.g. "HEAD" or "main"
  currentContent: string;
  incomingHeader: string; // e.g. "feature-branch"
  incomingContent: string;
}

/**
 * Parses content to find all Git 3-way merge conflict blocks
 */
export function parseMergeConflicts(content: string): MergeConflictBlock[] {
  if (!content || !content.includes('<<<<<<<')) return [];

  const lines = content.split(/\r?\n/);
  const conflicts: MergeConflictBlock[] = [];

  let inConflict = false;
  let startLine = -1;
  let currentHeader = '';
  let splitterLine = -1;
  let currentLines: string[] = [];
  let incomingLines: string[] = [];
  let inIncoming = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.startsWith('<<<<<<<')) {
      inConflict = true;
      inIncoming = false;
      startLine = lineNum;
      currentHeader = line.replace('<<<<<<<', '').trim() || 'Current Change';
      currentLines = [];
      incomingLines = [];
      splitterLine = -1;
    } else if (inConflict && line.startsWith('=======') && !inIncoming) {
      inIncoming = true;
      splitterLine = lineNum;
    } else if (inConflict && line.startsWith('>>>>>>>')) {
      const incomingHeader = line.replace('>>>>>>>', '').trim() || 'Incoming Change';
      const endLine = lineNum;

      conflicts.push({
        id: `conflict_${startLine}_${endLine}`,
        startLine,
        splitterLine: splitterLine !== -1 ? splitterLine : startLine + currentLines.length + 1,
        endLine,
        currentHeader,
        currentContent: currentLines.join('\n'),
        incomingHeader,
        incomingContent: incomingLines.join('\n'),
      });

      inConflict = false;
      inIncoming = false;
      startLine = -1;
      splitterLine = -1;
    } else if (inConflict) {
      if (inIncoming) {
        incomingLines.push(line);
      } else {
        currentLines.push(line);
      }
    }
  }

  return conflicts;
}

export type ConflictResolutionChoice = 'current' | 'incoming' | 'both';

/**
 * Resolves a specific conflict block within a file content string
 */
export function resolveConflictInContent(
  content: string,
  conflict: MergeConflictBlock,
  choice: ConflictResolutionChoice
): string {
  const lines = content.split(/\r?\n/);

  let replacement = '';
  if (choice === 'current') {
    replacement = conflict.currentContent;
  } else if (choice === 'incoming') {
    replacement = conflict.incomingContent;
  } else if (choice === 'both') {
    replacement = `${conflict.currentContent}\n${conflict.incomingContent}`;
  }

  const beforeLines = lines.slice(0, conflict.startLine - 1);
  const afterLines = lines.slice(conflict.endLine);

  const replacementLines = replacement ? replacement.split(/\r?\n/) : [];
  const result = [...beforeLines, ...replacementLines, ...afterLines].join('\n');

  return result;
}
