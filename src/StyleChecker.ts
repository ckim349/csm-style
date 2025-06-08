import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";
import { StyleCheckResult } from "./types";

export class StyleChecker {
  private readonly configPath: string;
  private readonly ignoredViolations: Set<string>;

  constructor(extensionPath: string, ignoredViolations: Set<string>) {
    this.configPath = path.join(extensionPath, "src", "config");
    this.ignoredViolations = ignoredViolations;
  }

  public async checkDocument(
    document: vscode.TextDocument
  ): Promise<StyleCheckResult | null> {
    if (document.languageId !== "python") {
      return null;
    }

    const filePath = document.uri.fsPath;
    const pycodestylePath = path.join(this.configPath, "custom_pycodestyle.py");
    const pylintPath = path.join(this.configPath, ".pylintrc");
    const ruffPath = path.join(this.configPath, "pyproject.toml");

    const allDiagnostics: vscode.Diagnostic[] = [];
    const allHighlightRanges: vscode.Range[] = [];

    await Promise.all([
      this.runStyleTool(
        `python "${pycodestylePath}" "${filePath}"`,
        document,
        allDiagnostics,
        allHighlightRanges
      ),
      this.runStyleTool(
        `pylint --rcfile "${pylintPath}" "${filePath}"`,
        document,
        allDiagnostics,
        allHighlightRanges
      ),
      this.runStyleTool(
        `ruff check --config "${ruffPath}" --preview "${filePath}"`,
        document,
        allDiagnostics,
        allHighlightRanges
      ),
    ]);

    return {
      diagnostics: allDiagnostics,
      highlightRanges: allHighlightRanges,
    };
  }

  private runStyleTool(
    command: string,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[],
    highlightRanges: vscode.Range[]
  ): Promise<void> {
    return new Promise((resolve) => {
      exec(
        command,
        { cwd: path.dirname(document.uri.fsPath) },
        (err, stdout) => {
          this.processToolOutput(
            stdout,
            document,
            diagnostics,
            highlightRanges
          );
          resolve();
        }
      );
    });
  }

  private processToolOutput(
    stdout: string,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[],
    highlightRanges: vscode.Range[]
  ): void {
    stdout.split("\n").forEach((row) => {
      if (this.shouldSkipRow(row)) {
        return;
      }

      const match = row.trim().match(/^(.+?):(\d+):(\d+): (.+)$/);
      if (!match) {
        return;
      }

      const [, , lineNumber, , message] = match;
      const line = parseInt(lineNumber, 10) - 1;

      if (this.isViolationIgnored(document.uri.fsPath, line, message)) {
        return;
      }

      const lineLength = document.lineAt(line).text.length;
      const range = new vscode.Range(
        new vscode.Position(line, 0),
        new vscode.Position(line, lineLength)
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        message,
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = "NCEA CSM Style";

      diagnostics.push(diagnostic);
      highlightRanges.push(range);
    });
  }

  private shouldSkipRow(row: string): boolean {
    return (
      row.startsWith("********") ||
      row.startsWith("---") ||
      row.startsWith("Your code has been rated") ||
      row.startsWith("Found ") ||
      row.startsWith("[*]")
    );
  }

  private isViolationIgnored(
    filePath: string,
    line: number,
    message: string
  ): boolean {
    const violationKey = `${filePath}:${line}:${message}`;
    return this.ignoredViolations.has(violationKey);
  }
}
