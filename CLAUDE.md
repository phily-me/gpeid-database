# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the gpEID specification - a structured identifier system defined in BNF (Backus-Naur Form) grammar. The main specification file is `gpeid.bnr`.

## gpEID Structure

The gpEID identifier consists of 5 components (4 mandatory + optional extensions):
1. **OrtsID** (Location) - prefix: `=` - Hierarchical location identifier
2. **FunktionsID** (Function) - prefix: `+` - Function codes using 3-letter abbreviations
3. **TypID** (Type) - prefix: `_` - Type identifier with mandatory 3-digit counter
4. **ProduktID** (Product) - prefix: `:` - Two-part manufacturer.product identifier
5. **ZusatzIDs** (Extensions) - prefixes: `-`, `$`, `|` - Optional additional identifiers

## Key Grammar Rules

- **TBD placeholders**: Allowed in middle levels of OrtsID, all FunktionsID parts, TypID parts, and ProduktID parts
- **Character restrictions**: Only Unicode letters and digits allowed in identifiers. Forbidden: `= + _ : - $ | .` and special characters
- **Mandatory components**: All four main aspects (Ort, Funktion, Typ, Produkt) are required
- **Type counter**: Always 3 digits (001-999)
- **Product structure**: Always two-part (Hersteller.Produkt)

## Development Notes

- The grammar uses Unicode character classes (L* for letters, Nd for digits)
- German umlauts (ÄÖÜäöüß) are explicitly supported
- Comments in the BNF are in German

## VSCode Extension

The `gpeid-linter` directory contains a VSCode extension for validating gpEID strings:

### Testing the Extension
1. Navigate to `gpeid-linter` directory
2. Run `node test/test-parser.js` to test the parser
3. Open the folder in VSCode and press F5 to launch the extension in a new window

### Extension Features
- Real-time validation of gpEID strings
- Hover tooltips showing parsed components
- Status bar command for manual validation
- Support for `.gpeid` files