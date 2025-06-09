import * as vscode from "vscode";
import * as path from "path";
import { StyleChecker } from "./StyleChecker";
import { ViolationQuickPickItem, DecorationManager } from "./types";
import { getViolationKey } from "./ignoreViolationsUtils";

export class CommandManager {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly ignoredViolations: Set<string>,
    private readonly styleChecker: StyleChecker,
    private readonly diagnosticCollection: vscode.DiagnosticCollection,
    private readonly decorationManager: DecorationManager
  ) {
    this.registerCommands();
  }

  private registerCommands(): void {
    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        "ncea-csm-style.ignoreSpecificViolation",
        this.ignoreSpecificViolation.bind(this)
      ),
      vscode.commands.registerCommand(
        "ncea-csm-style.manageIgnored",
        this.manageIgnored.bind(this)
      ),
      vscode.commands.registerCommand(
        "ncea-csm-style.clearAllIgnored",
        this.clearAllIgnored.bind(this)
      )
    );
  }

  private async ignoreSpecificViolation(
    filePath: string,
    line: number,
    message: string
  ): Promise<void> {
    const violationKey = getViolationKey(filePath, line, message);
    this.ignoredViolations.add(violationKey);
    this.saveIgnoredViolations();

    const document = vscode.workspace.textDocuments.find(
      (doc) => doc.uri.fsPath === filePath
    );
    if (document) {
      const result = await this.styleChecker.checkDocument(document);
      if (result) {
        this.diagnosticCollection.set(document.uri, result.diagnostics);
        this.decorationManager.applyDecorations(
          document,
          result.highlightRanges
        );
      }
    }

    vscode.window.showInformationMessage("Style violation ignored");
  }

  private async manageIgnored(): Promise<void> {
    if (this.ignoredViolations.size === 0) {
      vscode.window.showInformationMessage("No ignored violations");
      return;
    }

    const items = this.createQuickPickItems();
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select ignored violations to restore",
      canPickMany: true,
    });

    if (selected && selected.length > 0) {
      await this.restoreSelectedViolations(selected);
    }
  }

  private async clearAllIgnored(): Promise<void> {
    if (this.ignoredViolations.size === 0) {
      vscode.window.showInformationMessage("No ignored violations to clear");
      return;
    }

    const result = await vscode.window.showWarningMessage(
      `Clear all ${this.ignoredViolations.size} ignored violations?`,
      "Yes",
      "No"
    );

    if (result === "Yes") {
      this.ignoredViolations.clear();
      this.saveIgnoredViolations();

      await this.recheckAllPythonDocuments();
      vscode.window.showInformationMessage("All ignored violations cleared");
    }
  }

  private createQuickPickItems(): ViolationQuickPickItem[] {
    return Array.from(this.ignoredViolations).map((violation) => {
      const parts = violation.split(":");
      const filePath = parts[0] + ":" + parts[1];
      const line = parts[2];
      const message = parts[3];
      const fileName = path.basename(filePath);

      return {
        label: `${fileName}:${parseInt(line) + 1}`,
        description: message,
        detail: filePath,
        violation,
      };
    });
  }

  private async restoreSelectedViolations(
    selected: ViolationQuickPickItem[]
  ): Promise<void> {
    selected.forEach((item) => {
      this.ignoredViolations.delete(item.violation);
    });
    this.saveIgnoredViolations();

    const affectedFiles = new Set(selected.map((item) => item.detail));
    await this.recheckAffectedFiles(affectedFiles);

    vscode.window.showInformationMessage(
      `Restored ${selected.length} ignored violation(s)`
    );
  }

  private async recheckAffectedFiles(filePaths: Set<string>): Promise<void> {
    for (const filePath of filePaths) {
      const document = vscode.workspace.textDocuments.find(
        (doc) => doc.uri.fsPath === filePath
      );
      console.log(filePath);
      console.log(document);
      if (document) {
        this.decorationManager.clearDecorations(document);

        const result = await this.styleChecker.checkDocument(document);
        console.log(result);
        if (result) {
          this.diagnosticCollection.set(document.uri, result.diagnostics);
          this.decorationManager.applyDecorations(
            document,
            result.highlightRanges
          );
        }
      }
    }
  }

  private async recheckAllPythonDocuments(): Promise<void> {
    const pythonDocs = vscode.workspace.textDocuments.filter(
      (doc) => doc.languageId === "python"
    );
    await this.recheckAffectedFiles(
      new Set(pythonDocs.map((doc) => doc.uri.fsPath))
    );
  }

  private saveIgnoredViolations(): void {
    this.context.workspaceState.update(
      "ignoredViolations",
      Array.from(this.ignoredViolations)
    );
  }
}
