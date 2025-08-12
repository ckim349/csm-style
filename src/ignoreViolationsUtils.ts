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

      // Check if there are any CSM Style diagnostics in the range
      const relevantDiagnostics = context.diagnostics.filter(
        (diagnostic) => diagnostic.source === "CSM Style"
      );

      relevantDiagnostics.forEach((diagnostic) => {
        // Create ignore action
        const ignoreAction = new vscode.CodeAction(
          `Ignore: ${diagnostic.message.split("\n")[0]}`, // Show only first line of message
          vscode.CodeActionKind.QuickFix
        );

        // Extract original message (before the separator)
        const originalMessage =
          diagnostic.message.split("\n\n---\n\n")[0] ||
          diagnostic.message.split("\n")[0];

        ignoreAction.command = {
          command: "csm-style.ignoreSpecificViolation",
          title: "Ignore this violation",
          arguments: [
            document.uri.fsPath,
            diagnostic.range.start.line,
            originalMessage, // Use original message for ignoring
          ],
        };

        ignoreAction.diagnostics = [diagnostic];
        actions.push(ignoreAction);
      });

      return actions;
    },
  }
);
