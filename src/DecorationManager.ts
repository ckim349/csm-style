import * as vscode from "vscode";
import { DecorationManager } from "./types";

export class VSCodeDecorationManager implements DecorationManager {
  private readonly redHighlightDecoration: vscode.TextEditorDecorationType;
  private readonly pendingHighlights: Map<string, vscode.Range[]>;

  constructor() {
    this.redHighlightDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: "rgba(255, 0, 0, 0.3)",
    });
    this.pendingHighlights = new Map<string, vscode.Range[]>();
  }

  public applyDecorations(
    document: vscode.TextDocument,
    ranges: vscode.Range[]
  ): void {
    const editor = vscode.window.visibleTextEditors.find(
      (e) => e.document.uri.fsPath === document.uri.fsPath
    );
    if (editor) {
      // Clear existing decorations first
      editor.setDecorations(this.redHighlightDecoration, []);
      // Apply new decorations
      editor.setDecorations(this.redHighlightDecoration, ranges);
    } else {
      this.pendingHighlights.set(document.uri.fsPath, ranges);
    }
  }

  public handleVisibleEditorsChange(
    editors: readonly vscode.TextEditor[]
  ): void {
    editors.forEach((editor) => {
      const filePath = editor.document.uri.fsPath;
      const ranges = this.pendingHighlights.get(filePath);
      if (ranges) {
        // Clear existing decorations first
        editor.setDecorations(this.redHighlightDecoration, []);
        // Apply new decorations
        editor.setDecorations(this.redHighlightDecoration, ranges);
        this.pendingHighlights.delete(filePath);
      }
    });
  }

  public clearDecorations(document: vscode.TextDocument): void {
    const editor = vscode.window.visibleTextEditors.find(
      (e) => e.document.uri.fsPath === document.uri.fsPath
    );
    if (editor) {
      editor.setDecorations(this.redHighlightDecoration, []);
    }
    this.pendingHighlights.delete(document.uri.fsPath);
  }

  public dispose(): void {
    this.redHighlightDecoration.dispose();
    this.pendingHighlights.clear();
  }
}
