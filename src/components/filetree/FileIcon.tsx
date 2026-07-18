import React from 'react';
import {
  FileText,
  FileCode,
  Folder,
  FolderOpen,
  FileJson,
  Braces,
  Settings,
  Shield,
  Layers,
  Sparkles,
  FileCheck,
  Lock,
  FileBox,
  Database,
  GitBranch,
} from 'lucide-react';

interface FileIconProps {
  name: string;
  isFolder?: boolean;
  isExpanded?: boolean;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ name, isFolder, isExpanded, className = 'w-4 h-4' }) => {
  const baseName = name.toLowerCase();

  if (isFolder) {
    // Special folder names
    if (baseName === '.git') return <GitBranch className={`${className} text-orange-400`} />;
    if (baseName === 'node_modules') return <FileBox className={`${className} text-red-400`} />;
    if (baseName === 'public') return <Layers className={`${className} text-cyan-400`} />;
    if (baseName === 'src') return <Sparkles className={`${className} text-emerald-400`} />;
    if (baseName === 'dist' || baseName === 'build') return <FileCheck className={`${className} text-amber-400`} />;
    if (baseName === 'api' || baseName === 'server') return <Database className={`${className} text-violet-400`} />;
    return isExpanded ? (
      <FolderOpen className={`${className} text-amber-400`} />
    ) : (
      <Folder className={`${className} text-amber-400`} />
    );
  }

  const ext = name.split('.').pop()?.toLowerCase() || '';

  // Special filenames
  if (baseName === 'package.json') return <FileJson className={`${className} text-red-400`} />;
  if (baseName === 'tsconfig.json') return <Settings className={`${className} text-blue-500`} />;
  if (baseName === '.gitignore') return <GitBranch className={`${className} text-orange-500`} />;
  if (baseName === '.env') return <Shield className={`${className} text-emerald-400`} />;
  if (baseName.endsWith('.lock') || baseName === 'package-lock.json') return <Lock className={`${className} text-amber-500`} />;
  if (baseName === 'dockerfile') return <FileBox className={`${className} text-blue-400`} />;
  if (baseName === 'readme.md') return <FileText className={`${className} text-sky-400`} />;
  if (baseName === 'license') return <Shield className={`${className} text-emerald-300`} />;

  switch (ext) {
    case 'js':
    case 'cjs':
    case 'mjs':
      return <Braces className={`${className} text-yellow-400`} />;
    case 'ts':
    case 'cts':
    case 'mts':
      return <FileCode className={`${className} text-blue-400`} />;
    case 'jsx':
    case 'tsx':
      return <Sparkles className={`${className} text-cyan-400`} />;
    case 'html':
    case 'htm':
    case 'svelte':
    case 'vue':
      return <FileCode className={`${className} text-orange-500`} />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode className={`${className} text-indigo-400`} />;
    case 'json':
      return <FileJson className={`${className} text-yellow-300`} />;
    case 'md':
    case 'markdown':
    case 'mdx':
      return <FileText className={`${className} text-sky-400`} />;
    case 'mmd':
    case 'mermaid':
      return <Layers className={`${className} text-teal-400`} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
      return <FileCheck className={`${className} text-purple-400`} />;
    case 'mp4':
    case 'webm':
    case 'mov':
    case 'avi':
      return <FileCheck className={`${className} text-pink-400`} />;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return <FileCheck className={`${className} text-emerald-400`} />;
    case 'yml':
    case 'yaml':
    case 'toml':
      return <Settings className={`${className} text-rose-400`} />;
    case 'lock':
      return <Lock className={`${className} text-amber-300`} />;
    case 'csv':
    case 'tsv':
    case 'xls':
    case 'xlsx':
    case 'xlsm':
      return <Database className={`${className} text-emerald-500`} />;
    case 'py':
    case 'pyw':
      return <Braces className={`${className} text-blue-300`} />;
    case 'java':
    case 'kt':
    case 'kts':
      return <Braces className={`${className} text-red-300`} />;
    case 'go':
      return <Braces className={`${className} text-cyan-300`} />;
    case 'rs':
      return <Braces className={`${className} text-orange-300`} />;
    case 'php':
      return <Braces className={`${className} text-indigo-300`} />;
    case 'rb':
      return <Braces className={`${className} text-red-400`} />;
    case 'sh':
    case 'bash':
    case 'zsh':
      return <Braces className={`${className} text-emerald-400`} />;
    case 'sql':
      return <Database className={`${className} text-blue-400`} />;
    case 'xml':
      return <FileCode className={`${className} text-orange-400`} />;
    case 'graphql':
    case 'gql':
      return <Database className={`${className} text-pink-400`} />;
    case 'dockerfile':
    case 'dockerignore':
      return <FileBox className={`${className} text-blue-400`} />;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
      return <FileBox className={`${className} text-yellow-500`} />;
    default:
      return <FileText className={`${className} text-slate-400`} />;
  }
};
