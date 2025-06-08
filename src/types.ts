import * as vscode from "vscode";

export interface ViolationQuickPickItem extends vscode.QuickPickItem {
  violation: string;
  detail: string;
}

export interface StyleCheckResult {
  diagnostics: vscode.Diagnostic[];
  highlightRanges: vscode.Range[];
}

export interface DecorationManager {
  applyDecorations(document: vscode.TextDocument, ranges: vscode.Range[]): void;
  handleVisibleEditorsChange(editors: readonly vscode.TextEditor[]): void;
  clearDecorations(document: vscode.TextDocument): void;
  dispose(): void;
}
