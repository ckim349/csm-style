import * as vscode from "vscode";

export const loadIgnoredViolations = (
  context: vscode.ExtensionContext,
  ignoredViolations: Set<String>
) => {
  const ignored = context.workspaceState.get<string[]>("ignoredViolations", []);
  ignoredViolations.clear();
  ignored.forEach((item) => ignoredViolations.add(item));
};

export const getViolationKey = (
  filePath: string,
  line: number,
  message: string
): string => {
  return `${filePath}:${line}:${message}`;
};

export const isViolationIgnored = (
  filePath: string,
  line: number,
  message: string,
  ignoredViolations: Set<String>
): boolean => {
  return ignoredViolations.has(getViolationKey(filePath, line, message));
};

// Code Action Provider for "Ignore" quick fix
export const codeActionProvider = vscode.languages.registerCodeActionsProvider(
  "python",
  {
    provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range,
      context: vscode.CodeActionContext
    ) {
      const actions: vscode.CodeAction[] = [];

      // Check if there are any NCEA CSM Style diagnostics in the range
      const relevantDiagnostics = context.diagnostics.filter(
        (diagnostic) => diagnostic.source === "NCEA CSM Style"
      );

      relevantDiagnostics.forEach((diagnostic) => {
        const ignoreAction = new vscode.CodeAction(
          `Ignore: ${diagnostic.message}`,
          vscode.CodeActionKind.QuickFix
        );

        ignoreAction.command = {
          command: "ncea-csm-style.ignoreSpecificViolation",
          title: "Ignore this violation",
          arguments: [
            document.uri.fsPath,
            diagnostic.range.start.line,
            diagnostic.message,
          ],
        };

        ignoreAction.diagnostics = [diagnostic];
        actions.push(ignoreAction);
      });

      return actions;
    },
  }
);
