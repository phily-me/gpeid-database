# gpEID Linter for Visual Studio Code

A VSCode extension that validates gpEID identifiers according to the BNF grammar specification.

## Features

- Real-time validation of gpEID strings in your documents
- Syntax error highlighting with detailed error messages
- Hover information showing parsed gpEID components
- Command to validate selected text
- Support for `.gpeid` files and inline gpEID strings in any text file

## gpEID Structure

A valid gpEID consists of four mandatory components plus optional extensions:

1. **OrtsID** (Location) - starts with `=`
2. **FunktionsID** (Function) - starts with `+`
3. **TypID** (Type) - starts with `_`
4. **ProduktID** (Product) - starts with `:`
5. **ZusatzIDs** (Extensions) - optional, start with `-`, `$`, or `|`

### Example

Valid gpEID: `=Building1.Floor2+HLK.TBD_Sensor.001:Siemens.ABC123-Config.v2$Serial.12345`

## Usage

### Automatic Validation

The extension automatically validates gpEID strings in:
- Files with `.gpeid` extension
- Inline gpEID strings in any text or markdown file

### Manual Validation

1. Select a gpEID string in your editor
2. Click the "Validate gpEID" button in the status bar
3. Or use the command palette: `Validate gpEID`

### Hover Information

Hover over any valid gpEID string to see its parsed components.

## Extension Settings

- `gpeidLinter.enable`: Enable/disable gpEID linting
- `gpeidLinter.validateOnType`: Validate gpEID strings as you type

## Installation

1. Open the `gpeid-linter` folder in VSCode
2. Run `npm install` to install dependencies
3. Press `F5` to open a new VSCode window with the extension loaded
4. Open any file and start writing gpEID strings

## Requirements

- Visual Studio Code 1.74.0 or higher
- Node.js 16.x or higher