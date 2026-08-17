import { parseMergeConflicts, resolveConflictInContent, ConflictResolutionChoice } from '../../utils/conflictParser';

let codeLensProviderDisposable: any = null;

/**
 * Registers Monaco CodeLens Provider for interactive 1-click Git Merge Conflict buttons
 */
export function registerConflictCodeLens(monaco: any, onResolve: (newContent: string) => void) {
  if (codeLensProviderDisposable) {
    try {
      codeLensProviderDisposable.dispose();
    } catch (_) {}
  }

  // Register an editor command to handle the click action
  monaco.editor.addEditorAction({
    id: 'codestudio.resolveConflict',
    label: 'Resolve Conflict',
    run: (_ed: any, args: any) => {
      if (args && args.conflict && args.choice && typeof args.getContent === 'function') {
        const fullContent = args.getContent();
        const updated = resolveConflictInContent(fullContent, args.conflict, args.choice);
        onResolve(updated);
      }
    },
  });


  codeLensProviderDisposable = monaco.languages.registerCodeLensProvider('*', {
    provideCodeLenses: (model: any) => {
      const text = model.getValue();
      const conflicts = parseMergeConflicts(text);
      if (conflicts.length === 0) return { lenses: [], dispose: () => {} };

      const lenses: any[] = [];

      for (const conflict of conflicts) {
        const range = {
          startLineNumber: conflict.startLine,
          startColumn: 1,
          endLineNumber: conflict.startLine,
          endColumn: 1,
        };

        // 1. Accept Current Change
        lenses.push({
          range,
          command: {
            id: 'codestudio.resolveConflict',
            title: '🟢 Accept Current Change',
            arguments: [
              {
                conflict,
                choice: 'current' as ConflictResolutionChoice,
                getContent: () => model.getValue(),
              },
            ],
          },
        });

        // 2. Accept Incoming Change
        lenses.push({
          range,
          command: {
            id: 'codestudio.resolveConflict',
            title: '🟣 Accept Incoming Change',
            arguments: [
              {
                conflict,
                choice: 'incoming' as ConflictResolutionChoice,
                getContent: () => model.getValue(),
              },
            ],
          },
        });

        // 3. Accept Both Changes
        lenses.push({
          range,
          command: {
            id: 'codestudio.resolveConflict',
            title: 'Accept Both Changes',
            arguments: [
              {
                conflict,
                choice: 'both' as ConflictResolutionChoice,
                getContent: () => model.getValue(),
              },
            ],
          },
        });
      }

      return {
        lenses,
        dispose: () => {},
      };
    },
    resolveCodeLens: (_model: any, codeLens: any) => codeLens,
  });

  return codeLensProviderDisposable;
}

/**
 * Updates Monaco Editor background decorations for conflict blocks
 */
export function updateConflictDecorations(
  editor: any,
  monaco: any,
  oldDecorations: string[] = []
): string[] {
  if (!editor || !monaco) return [];

  const model = editor.getModel();
  if (!model) return [];

  const text = model.getValue();
  const conflicts = parseMergeConflicts(text);

  if (conflicts.length === 0) {
    return editor.deltaDecorations(oldDecorations, []);
  }

  const newDecorations: any[] = [];

  for (const c of conflicts) {
    // Current change header & block
    newDecorations.push({
      range: new monaco.Range(c.startLine, 1, c.splitterLine - 1, 1),
      options: {
        isWholeLine: true,
        className: 'bg-emerald-950/30 border-l-4 border-emerald-500',
        linesDecorationsClassName: 'codestudio-conflict-current-gutter',
      },
    });

    // Incoming change block
    newDecorations.push({
      range: new monaco.Range(c.splitterLine, 1, c.endLine, 1),
      options: {
        isWholeLine: true,
        className: 'bg-cyan-950/30 border-l-4 border-cyan-500',
        linesDecorationsClassName: 'codestudio-conflict-incoming-gutter',
      },
    });
  }

  return editor.deltaDecorations(oldDecorations, newDecorations);
}
