import * as vscode from "vscode";
import { VSCodeDecorationManager } from "./DecorationManager";
import { StyleChecker } from "./StyleChecker";
import { CommandManager } from "./CommandManager";
import {
  loadIgnoredViolations,
  codeActionProvider,
} from "./ignoreViolationsUtils";

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("CSM Style");
  const decorationManager = new VSCodeDecorationManager();
  const ignoredViolations = new Set<string>();

  loadIgnoredViolations(context, ignoredViolations);

  const styleChecker = new StyleChecker(
    context.extensionPath,
    ignoredViolations
  );
  new CommandManager(
    context,
    ignoredViolations,
    styleChecker,
    diagnosticCollection,
    decorationManager
  );

  context.subscriptions.push(codeActionProvider);

  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors((editors) => {
      decorationManager.handleVisibleEditorsChange(editors);
    })
  );

  const checkDocument = async (document: vscode.TextDocument) => {
    const result = await styleChecker.checkDocument(document);
    if (result) {
      diagnosticCollection.set(document.uri, result.diagnostics);
      decorationManager.applyDecorations(document, result.highlightRanges);
    }
  };

  vscode.workspace.textDocuments.forEach(checkDocument);
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(checkDocument),
    vscode.workspace.onDidSaveTextDocument(checkDocument),
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticCollection.delete(document.uri);
    })
  );

  context.subscriptions.push(diagnosticCollection, decorationManager);
}

export function deactivate() {}
