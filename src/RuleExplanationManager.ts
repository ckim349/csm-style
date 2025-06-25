import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { RuleExplanation } from "./types";

export class RuleExplanationManager {
  private ruleExplanations: Map<string, RuleExplanation> = new Map();

  constructor(extensionPath: string) {
    this.loadRuleExplanations(extensionPath);
  }

  private loadRuleExplanations(extensionPath: string): void {
    try {
      const configPath = path.join(
        extensionPath,
        "src",
        "config",
        "rule-explanations.json"
      );
      const data = fs.readFileSync(configPath, "utf8");
      const explanations = JSON.parse(data);

      for (const [code, explanation] of Object.entries(explanations)) {
        this.ruleExplanations.set(code, explanation as RuleExplanation);
      }
    } catch (error) {
      console.warn("Failed to load rule explanations:", error);
    }
  }

  public getRuleExplanation(message: string): RuleExplanation | undefined {
    // Extract rule code from various message formats
    const patterns = [
      /^([A-Z]\d{3})\s/, // E501, Q000, etc.
      /^([A-Z]{3}\d+)\s/, // CSM1, CSM2, etc.
      /^([A-Z]\d{4}):/, // C0103: format (Pylint)
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return this.ruleExplanations.get(match[1]);
      }
    }

    return undefined;
  }

  public enhanceDiagnosticMessage(message: string): string {
    const explanation = this.getRuleExplanation(message);
    if (!explanation) {
      return message;
    }

    // Start with the original message
    let enhancedMessage = message;

    // Add a separator
    enhancedMessage += `\n\n---\n\n`;

    // Add the enhanced information
    enhancedMessage += `${explanation.description}`;

    if (explanation.rationale) {
      enhancedMessage += `\n\n**Rationale:** ${explanation.rationale}`;
    }

    if (explanation.csmRelation) {
      enhancedMessage += `\n\n**CSM Relation:** ${explanation.csmRelation}`;
    }

    return enhancedMessage;
  }

  public createDetailedDiagnostic(
    range: vscode.Range,
    originalMessage: string,
    severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Error
  ): vscode.Diagnostic {
    const explanation = this.getRuleExplanation(originalMessage);
    const enhancedMessage = this.enhanceDiagnosticMessage(originalMessage);

    const diagnostic = new vscode.Diagnostic(range, enhancedMessage, severity);
    diagnostic.source = "CSM Style";

    // Add the original message as a code for reference
    if (explanation) {
      diagnostic.code = explanation.code;
    }

    return diagnostic;
  }

  public getAllRuleCodes(): string[] {
    return Array.from(this.ruleExplanations.keys());
  }

  public getExplanation(code: string): RuleExplanation | undefined {
    return this.ruleExplanations.get(code);
  }
}
