import React, { useState, useRef } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useDialogStore } from '../../stores/useDialogStore';
import { ContextMenuTarget } from '../../types/fileSystem';
import { FileIcon } from './FileIcon';
import { downloadFileItem } from '../../utils/fileUtils';
import {
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  FolderOpen,
  FolderInput,
  FolderMinus,
  Trash2,
  Edit3,
  Copy,
  Download,
  MoreVertical,
  UploadCloud,
  RotateCcw,
  FolderTree,
  Sparkles,
  FileArchive,
} from 'lucide-react';

export const FileTree: React.FC = () => {
  const {
    files,
    activeFileId,
    searchFilter,
    setSearchFilter,
    openFileInTab,
    toggleFolderExpand,
    createFile,
    createFolder,
    renameFileItem,
    deleteFileItem,
    duplicateFileItem,
    moveFileItem,
    collapseAllFolders: collapseAllStoreFolders,
    resetToDefaultFiles,
    importFilesFromOS,
    openSystemFolder,
    addFolderToWorkspace,
    removeFolderFromWorkspace,
    openSystemFile,
  } = useFileStore();

  const { openDialog } = useDialogStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const rootFiles = files.filter(f => f.parentId === null);

  // In-app dialog for creating files/folders
  const showCreateFileDialog = async (parentId: string | null = null) => {
    const result = await openDialog({
      type: 'file',
      title: 'Create New File',
      message: 'Enter the filename with extension (e.g., app.tsx, index.html)',
      placeholder: 'app.tsx',
      confirmText: 'Create File',
      cancelText: 'Cancel',
    });

    if (result) {
      createFile(result, parentId);
    }
  };

  const showCreateFolderDialog = async (parentId: string | null = null) => {
    const result = await openDialog({
      type: 'folder',
      title: 'Create New Folder',
      message: 'Enter the folder name',
      placeholder: 'my-folder',
      confirmText: 'Create Folder',
      cancelText: 'Cancel',
    });

    if (result) {
      createFolder(result, parentId);
    }
  };

  const handleRenameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (renamingId && renamingName.trim()) {
      renameFileItem(renamingId, renamingName.trim());
    }
    setRenamingId(null);
    setRenamingName('');
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string | null, isFolder: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 230;
    const menuHeight = 360;
    const padding = 12;

    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + menuWidth > window.innerWidth - padding) {
      posX = window.innerWidth - menuWidth - padding;
    }
    if (posY + menuHeight > window.innerHeight - padding) {
      posY = Math.max(padding, window.innerHeight - menuHeight - padding);
    }

    setContextMenu({
      x: Math.max(padding, posX),
      y: Math.max(padding, posY),
      fileId,
      isFolder,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/codestudio-file-id', id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    const types = Array.from(e.dataTransfer.types || []);
    const hasInternalFile = types.includes('application/codestudio-file-id');
    const hasExternalFiles = types.includes('Files');

    if (hasInternalFile || hasExternalFiles) {
      e.dataTransfer.dropEffect = hasExternalFiles ? 'copy' : 'move';
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverFolderId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetParentId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      importFilesFromOS(e.dataTransfer.files, targetParentId);
      return;
    }

    const sourceId = e.dataTransfer.getData('application/codestudio-file-id') || e.dataTransfer.getData('text/plain');
    if (sourceId) {
      moveFileItem(sourceId, targetParentId);
    }
  };

  const collapseAllFolders = () => {
    collapseAllStoreFolders();
  };

  const createTemplateFile = (type: 'react' | 'html' | 'mermaid' | 'ts') => {
    const templates = {
      react: { name: 'Component.tsx', content: `import React from 'react';\n\nexport const MyComponent: React.FC = () => {\n  return <div>Hello Zenith Studio!</div>;\n};\n` },

      html: { name: 'index.html', content: `<!DOCTYPE html>\n<html>\n<head>\n  <title>New Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n` },
      mermaid: { name: 'diagram.mermaid', content: `graph TD\n    A[Start] --> B[Process]\n    B --> C[Done]\n` },
      ts: { name: 'utils.ts', content: `export const multiply = (a: number, b: number): number => a * b;\n` },
    };

    const tmpl = templates[type];
    createFile(tmpl.name, null, tmpl.content);
  };

  const renderTreeNodes = (parentId: string | null, depth = 0) => {
    const children = files
      .filter(f => f.parentId === parentId)
      .filter(f => {
        if (!searchFilter.trim()) return true;
        return f.name.toLowerCase().includes(searchFilter.toLowerCase());
      })
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return children.map(item => {
      const isSelected = activeFileId === item.id;
      const isFolder = item.type === 'folder';
      const isTargetDrag = dragOverFolderId === item.id;

      return (
        <div key={item.id} className="select-none">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, isFolder ? item.id : item.parentId)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => isFolder ? handleDrop(e, item.id) : handleDrop(e, item.parentId)}
            onContextMenu={(e) => handleContextMenu(e, item.id, isFolder)}
            onClick={() => {
              if (isFolder) {
                toggleFolderExpand(item.id);
              } else {
                openFileInTab(item.id);
              }
            }}
            style={{ paddingLeft: `${depth * 14 + 12}px` }}
            className={`group flex items-center gap-2 py-1 px-2 text-xs cursor-pointer transition rounded-sm ${
              isSelected
                ? 'bg-blue-600/30 text-white font-medium border-l-2 border-blue-500'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            } ${isTargetDrag ? 'bg-blue-900/50 outline outline-1 outline-blue-500' : ''}`}
          >
            {isFolder ? (
              <span className="text-slate-400 hover:text-white transition">
                {item.isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ) : (
              <span className="w-3.5 h-3.5" />
            )}

            <FileIcon name={item.name} isFolder={isFolder} isExpanded={item.isExpanded} className="w-4 h-4 shrink-0" />

            {renamingId === item.id ? (
              <form onSubmit={handleRenameSubmit} onClick={e => e.stopPropagation()} className="flex items-center flex-1">
                <input
                  type="text"
                  autoFocus
                  value={renamingName}
                  onChange={(e) => setRenamingName(e.target.value)}
                  onBlur={() => handleRenameSubmit()}
                  className="w-full bg-slate-900 text-white text-xs px-1 py-0.5 rounded outline-none border border-blue-500 font-mono"
                />
              </form>
            ) : (
              <span className="truncate flex-1 font-mono text-[12.5px]">{item.name}</span>
            )}

            {item.isModified && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity text-slate-400">
              {isFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showCreateFileDialog(item.id);
                  }}
                  className="p-0.5 hover:text-white hover:bg-slate-700 rounded"
                  title="New File in folder"
                >
                  <FilePlus className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, item.id, isFolder);
                }}
                className="p-0.5 hover:text-white hover:bg-slate-700 rounded"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </div>
          </div>

          {isFolder && item.isExpanded && renderTreeNodes(item.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div
      onClick={closeContextMenu}
      onDragOver={(e) => handleDragOver(e, null)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, null)}
      onContextMenu={(e) => handleContextMenu(e, null, false)}
      className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none relative"
    >
      {/* Top Header bar with buttons */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-[#1e1e2e]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => showCreateFileDialog(null)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            title="New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => showCreateFolderDialog(null)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openSystemFolder}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
            title="Open Folder (Single-Root Workspace)"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={addFolderToWorkspace}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded transition"
            title="Add Folder to Workspace... (Multi-Root: 4-5 Folders Open Together)"
          >
            <FolderInput className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={collapseAllFolders}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            title="Collapse Folders"
          >
            <FolderTree className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            title="Upload Files / ZIP"
          >
            <UploadCloud className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="*/*"
            className="hidden"
            onChange={(e) => e.target.files && importFilesFromOS(e.target.files)}
          />
        </div>
      </div>

      {/* Quick Search Filter */}
      <div className="p-2 border-b border-slate-800/60 bg-[#181825]">
        <input
          type="text"
          placeholder="Filter files..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 text-xs px-2.5 py-1 rounded border border-slate-800 focus:border-blue-500 outline-none transition"
        />
      </div>

      {/* Main File Tree List */}
      <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
        {rootFiles.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 space-y-2">
            <p>No files in project workspace.</p>
            <button
              onClick={resetToDefaultFiles}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition"
            >
              Reset Sample Project
            </button>
          </div>
        ) : (
          renderTreeNodes(null)
        )}
      </div>

      {/* Bottom Drop Zone Indicator */}
      <div className="p-2 border-t border-slate-800/80 bg-[#14141f] text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <FileArchive className="w-3 h-3" />
          Drag files or ZIP to upload
        </span>
        <button
          onClick={resetToDefaultFiles}
          className="hover:text-slate-300 flex items-center gap-1 transition"
          title="Reset to default sample files"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Context Menu Popup & Backdrop */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[999] bg-transparent"
            onClick={closeContextMenu}
            onContextMenu={(e) => {
              e.preventDefault();
              closeContextMenu();
            }}
          />
          <div
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="fixed z-[1000] w-56 max-h-[calc(100vh-24px)] overflow-y-auto bg-[#181926] border border-slate-700/90 shadow-2xl rounded-xl py-1 text-xs text-slate-200 divide-y divide-slate-800 font-sans backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="py-1">
            <button
              onClick={() => {
                showCreateFileDialog(contextMenu.fileId);
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
            >
              <FilePlus className="w-3.5 h-3.5 text-blue-400" />
              <span>New File</span>
            </button>
            <button
              onClick={() => {
                showCreateFolderDialog(contextMenu.fileId);
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => {
                openSystemFile();
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
            >
              <FilePlus className="w-3.5 h-3.5 text-blue-400" />
              <span>Open File from System</span>
            </button>
            <button
              onClick={() => {
                openSystemFolder();
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open Folder from System</span>
            </button>
          </div>

          {/* Quick Starter Templates */}
          <div className="py-1">
            <span className="px-3 py-1 text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Templates
            </span>
            <button
              onClick={() => {
                createTemplateFile('react');
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1 hover:bg-blue-600 hover:text-white transition text-left text-[11px]"
            >
              React Component (.tsx)
            </button>
            <button
              onClick={() => {
                createTemplateFile('mermaid');
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-1 hover:bg-blue-600 hover:text-white transition text-left text-[11px]"
            >
              Mermaid Diagram (.mermaid)
            </button>
          </div>

          {contextMenu.fileId && (
            <div className="py-1">
              <button
                onClick={() => {
                  setRenamingId(contextMenu.fileId);
                  const target = files.find(f => f.id === contextMenu.fileId);
                  if (target) setRenamingName(target.name);
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rename</span>
              </button>

              {!contextMenu.isFolder && (
                <button
                  onClick={() => {
                    if (contextMenu.fileId) duplicateFileItem(contextMenu.fileId);
                    closeContextMenu();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate File</span>
                </button>
              )}

              <button
                onClick={() => {
                  const item = files.find(f => f.id === contextMenu.fileId);
                  if (item) {
                    downloadFileItem(item);
                  }
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download File</span>
              </button>
            </div>
          )}

          {contextMenu.fileId && (
            <div className="py-1">
              {contextMenu.isFolder && (() => {
                const target = files.find(f => f.id === contextMenu.fileId);
                if (target && target.parentId === null) {
                  return (
                    <button
                      onClick={() => {
                        if (contextMenu.fileId) removeFolderFromWorkspace(contextMenu.fileId);
                        closeContextMenu();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-amber-600 hover:text-white text-amber-300 transition text-left"
                    >
                      <FolderMinus className="w-3.5 h-3.5" />
                      <span>Remove Folder from Workspace</span>
                    </button>
                  );
                }
                return null;
              })()}

              <button
                onClick={() => {
                  if (contextMenu.fileId) deleteFileItem(contextMenu.fileId);
                  closeContextMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-600 hover:text-white text-red-400 transition text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {contextMenu.isFolder ? 'Folder & Contents' : 'File'}</span>
              </button>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};
