import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("NCEA CSM Style");
  context.subscriptions.push(diagnosticCollection);

  const runStyleCheck = (document: vscode.TextDocument) => {
    if (document.languageId !== "python") {
      return;
    }

    const filePath = document.uri.fsPath;
    const configPath = path.join(context.extensionPath, "src", "config");
    const pycodestylePath = path.join(configPath, "custom_pycodestyle.py");
    const pylintPath = path.join(configPath, ".pylintrc");
    const ruffPath = path.join(configPath, "pyproject.toml");

    const allDiagnostics: vscode.Diagnostic[] = [];
    const allHighlightRanges: vscode.Range[] = [];

    const editor = vscode.window.visibleTextEditors.find(
      (e) => e.document.uri.fsPath === document.uri.fsPath
    );

    const redHighlightDecoration = vscode.window.createTextEditorDecorationType(
      {
        backgroundColor: "rgba(255, 0, 0, 0.3)",
      }
    );

    let completed = 0;

    const handleOutput = (stdout: string) => {
      stdout.split("\n").forEach((row) => {
        if (
          row.startsWith("********") ||
          row.startsWith("---") ||
          row.startsWith("Your code has been rated") ||
          row.startsWith("Found ") ||
          row.startsWith("[*]")
        ) {
          return;
        }

        const trimmedRow = row.trim();
        const match = trimmedRow.match(/^(.+?):(\d+):(\d+): (.+)$/);
        if (!match) {
          return;
        }

        const [, , lineNumber, colnum, message] = match;
        console.log(lineNumber, colnum, message);

        const line = parseInt(lineNumber, 10) - 1;

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

        allDiagnostics.push(diagnostic);
        allHighlightRanges.push(range);
      });
    };

    const onDone = () => {
      completed++;
      if (completed === 3) {
        diagnosticCollection.set(document.uri, allDiagnostics);
        if (editor) {
          editor.setDecorations(redHighlightDecoration, allHighlightRanges);
        }
      }
    };

    const makeExec = (command: string) => {
      exec(command, { cwd: path.dirname(filePath) }, (err, stdout, stderr) => {
        handleOutput(stdout);
        onDone();
      });
    };

    makeExec(`python "${pycodestylePath}" "${filePath}"`);
    makeExec(`pylint --rcfile "${pylintPath}" "${filePath}"`);
    makeExec(`ruff check --config "${ruffPath}" "${filePath}" --preview`);
  };

  // Run on open, save and delete on close
  vscode.workspace.textDocuments.forEach(runStyleCheck);
  vscode.workspace.onDidOpenTextDocument(runStyleCheck);
  vscode.workspace.onDidSaveTextDocument(runStyleCheck);
  vscode.workspace.onDidCloseTextDocument((document) => {
    diagnosticCollection.delete(document.uri);
  });
}

export function deactivate() {}
