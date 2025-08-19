const vscode = require('vscode');
const GpeidParser = require('./parser');

let diagnosticCollection;

function activate(context) {
    console.log('gpEID Linter is now active!');
    
    diagnosticCollection = vscode.languages.createDiagnosticCollection('gpeid');
    context.subscriptions.push(diagnosticCollection);
    
    const parser = new GpeidParser();
    
    const validateDocument = (document) => {
        if (!vscode.workspace.getConfiguration('gpeidLinter').get('enable')) {
            diagnosticCollection.clear();
            return;
        }
        
        const diagnostics = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        const gpeidPattern = /(?:^|[\s,;])(=[^\s,;]+\+[^\s,;]+_[^\s,;]+:[^\s,;]+(?:[-$|][^\s,;]+)*)/g;
        
        lines.forEach((line, lineIndex) => {
            let match;
            while ((match = gpeidPattern.exec(line)) !== null) {
                const gpeidString = match[1];
                const startPos = match.index + (match[0].length - gpeidString.length);
                
                const result = parser.parse(gpeidString);
                
                if (!result.valid) {
                    const range = new vscode.Range(
                        lineIndex, startPos,
                        lineIndex, startPos + gpeidString.length
                    );
                    
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Invalid gpEID: ${result.errors.map(e => e.message).join(', ')}`,
                        vscode.DiagnosticSeverity.Error
                    );
                    
                    diagnostics.push(diagnostic);
                }
            }
        });
        
        diagnosticCollection.set(document.uri, diagnostics);
    };
    
    const validateGpeidSelection = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        
        if (!text) {
            vscode.window.showInformationMessage('Please select a gpEID string to validate');
            return;
        }
        
        const result = parser.parse(text.trim());
        
        if (result.valid) {
            vscode.window.showInformationMessage(`✓ Valid gpEID: ${text.trim()}`);
        } else {
            vscode.window.showErrorMessage(
                `✗ Invalid gpEID: ${result.errors.map(e => e.message).join(', ')}`
            );
        }
    };
    
    const validateCommand = vscode.commands.registerCommand('gpeid.validate', validateGpeidSelection);
    context.subscriptions.push(validateCommand);
    
    const provideHover = (document, position) => {
        const wordRange = document.getWordRangeAtPosition(position, /=[^\s,;]+\+[^\s,;]+_[^\s,;]+:[^\s,;]+(?:[-$|][^\s,;]+)*/);
        if (!wordRange) {
            return null;
        }
        
        const word = document.getText(wordRange);
        const result = parser.parse(word);
        
        if (result.valid && result.parsed) {
            const parts = [];
            parts.push('**Valid gpEID**\n');
            parts.push(`- **Location**: =${result.parsed.ortsID.join('.')}`);
            parts.push(`- **Function**: +${result.parsed.funktionsID.join('.')}`);
            parts.push(`- **Type**: _${result.parsed.typID.core.join('.')}.${result.parsed.typID.counter}`);
            parts.push(`- **Product**: :${result.parsed.produktID.manufacturer}.${result.parsed.produktID.product}`);
            
            if (result.parsed.zusatzIDs.length > 0) {
                parts.push(`- **Extensions**: ${result.parsed.zusatzIDs.map(z => z.separator + z.parts.join('.')).join(' ')}`);
            }
            
            return new vscode.Hover(new vscode.MarkdownString(parts.join('\n')));
        }
        
        return null;
    };
    
    const hoverProvider = vscode.languages.registerHoverProvider(
        ['plaintext', 'markdown', 'gpeid'],
        { provideHover }
    );
    context.subscriptions.push(hoverProvider);
    
    vscode.workspace.textDocuments.forEach(validateDocument);
    
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(validateDocument)
    );
    
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.workspace.getConfiguration('gpeidLinter').get('validateOnType')) {
                validateDocument(event.document);
            }
        })
    );
    
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(validateDocument)
    );
    
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'gpeid.validate';
    statusBarItem.text = '$(check) Validate gpEID';
    statusBarItem.tooltip = 'Validate selected gpEID string';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
        diagnosticCollection.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};