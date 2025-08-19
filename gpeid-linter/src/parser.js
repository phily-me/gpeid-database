class GpeidParser {
    constructor() {
        this.errors = [];
        this.position = 0;
        this.input = '';
    }

    parse(input) {
        this.errors = [];
        this.position = 0;
        this.input = input;
        
        try {
            const result = this.parseGpEID();
            if (this.position < this.input.length) {
                this.addError(`Unexpected characters after valid gpEID: '${this.input.substring(this.position)}'`);
            }
            return {
                valid: this.errors.length === 0,
                errors: this.errors,
                parsed: result
            };
        } catch (e) {
            this.addError(e.message);
            return {
                valid: false,
                errors: this.errors
            };
        }
    }

    parseGpEID() {
        const result = {};
        
        result.ortsID = this.parseOrtsID();
        result.funktionsID = this.parseFunktionsID();
        result.typID = this.parseTypID();
        result.produktID = this.parseProduktID();
        result.zusatzIDs = this.parseZusatzIDs();
        
        return result;
    }

    parseOrtsID() {
        if (!this.consume('=')) {
            throw new Error(`Expected '=' for OrtsID at position ${this.position}`);
        }
        return this.parseOrtSeq();
    }

    parseOrtSeq() {
        const parts = [];
        
        const liegenschaft = this.parseLiegenschaft();
        if (!liegenschaft) {
            throw new Error(`Invalid Liegenschaft at position ${this.position}`);
        }
        parts.push(liegenschaft);
        
        while (this.peek() === '.') {
            this.consume('.');
            if (this.peek() === '.' || this.peek() === '+' || this.peek() === '_' || this.peek() === ':') {
                parts.push('');
            } else {
                const ortTeil = this.parseOrtTeil();
                if (ortTeil) {
                    parts.push(ortTeil);
                }
            }
        }
        
        return parts;
    }

    parseLiegenschaft() {
        if (this.peekWord('TBD')) {
            throw new Error(`Liegenschaft cannot be 'TBD' at position ${this.position}`);
        }
        return this.parseOrtReal();
    }

    parseOrtTeil() {
        if (this.peekWord('TBD')) {
            this.position += 3;
            return 'TBD';
        }
        return this.parseOrtReal();
    }

    parseOrtReal() {
        const start = this.position;
        while (this.position < this.input.length && this.isUniAlnum(this.input[this.position])) {
            this.position++;
        }
        if (this.position === start) {
            return null;
        }
        return this.input.substring(start, this.position);
    }

    parseFunktionsID() {
        if (!this.consume('+')) {
            throw new Error(`Expected '+' for FunktionsID at position ${this.position}`);
        }
        return this.parseFktSeq();
    }

    parseFktSeq() {
        const parts = [];
        
        const firstPart = this.parseFktTeil();
        if (!firstPart) {
            throw new Error(`Invalid FunktionsID part at position ${this.position}`);
        }
        parts.push(firstPart);
        
        while (this.peek() === '.') {
            this.consume('.');
            const part = this.parseFktTeil();
            if (!part) {
                throw new Error(`Invalid FunktionsID part at position ${this.position}`);
            }
            parts.push(part);
        }
        
        return parts;
    }

    parseFktTeil() {
        if (this.peekWord('TBD')) {
            this.position += 3;
            return 'TBD';
        }
        
        const aaa = this.parseAAA();
        if (aaa) {
            return aaa;
        }
        
        return null;
    }

    parseAAA() {
        const start = this.position;
        let count = 0;
        
        while (count < 3 && this.position < this.input.length) {
            const char = this.input[this.position];
            if (char >= 'A' && char <= 'Z') {
                this.position++;
                count++;
            } else {
                break;
            }
        }
        
        if (count === 3) {
            const next = this.peek();
            if (!next || next === '.' || next === '_' || next === ':' || next === '-' || next === '$' || next === '|') {
                return this.input.substring(start, this.position);
            }
        }
        
        this.position = start;
        return null;
    }

    parseTypID() {
        if (!this.consume('_')) {
            throw new Error(`Expected '_' for TypID at position ${this.position}`);
        }
        return this.parseTypSeq();
    }

    parseTypSeq() {
        const typCore = this.parseTypCore();
        if (!typCore || typCore.length === 0) {
            throw new Error(`Invalid TypCore at position ${this.position}`);
        }
        
        if (!this.consume('.')) {
            throw new Error(`Expected '.' before counter in TypID at position ${this.position}`);
        }
        
        const zaehl = this.parseZaehl();
        if (!zaehl) {
            throw new Error(`Invalid 3-digit counter in TypID at position ${this.position}`);
        }
        
        return {
            core: typCore,
            counter: zaehl
        };
    }

    parseTypCore() {
        const parts = [];
        
        const firstPart = this.parseTypTeil();
        if (!firstPart) {
            return null;
        }
        parts.push(firstPart);
        
        while (this.peek() === '.' && this.peekAhead(1) !== null && !this.isDigit(this.peekAhead(1))) {
            this.consume('.');
            const part = this.parseTypTeil();
            if (!part) {
                this.position--;
                break;
            }
            parts.push(part);
        }
        
        return parts;
    }

    parseTypTeil() {
        if (this.peekWord('TBD')) {
            this.position += 3;
            return 'TBD';
        }
        return this.parseWithLetter();
    }

    parseWithLetter() {
        const start = this.position;
        let hasLetter = false;
        
        while (this.position < this.input.length && this.isUniAlnum(this.input[this.position])) {
            if (this.isUniLetter(this.input[this.position])) {
                hasLetter = true;
            }
            this.position++;
        }
        
        if (this.position > start && hasLetter) {
            return this.input.substring(start, this.position);
        }
        
        this.position = start;
        return null;
    }

    parseZaehl() {
        const start = this.position;
        let count = 0;
        
        while (count < 3 && this.position < this.input.length && this.isDigit(this.input[this.position])) {
            this.position++;
            count++;
        }
        
        if (count === 3) {
            const counter = this.input.substring(start, this.position);
            if (counter !== '000') {
                return counter;
            }
            this.addError(`Counter cannot be '000' at position ${start}`);
        }
        
        this.position = start;
        return null;
    }

    parseProduktID() {
        if (!this.consume(':')) {
            throw new Error(`Expected ':' for ProduktID at position ${this.position}`);
        }
        return this.parseProdSeq();
    }

    parseProdSeq() {
        const hersteller = this.parseProdTeil();
        if (!hersteller) {
            throw new Error(`Invalid manufacturer in ProduktID at position ${this.position}`);
        }
        
        if (!this.consume('.')) {
            throw new Error(`Expected '.' in ProduktID at position ${this.position}`);
        }
        
        const produkt = this.parseProdTeil();
        if (!produkt) {
            throw new Error(`Invalid product in ProduktID at position ${this.position}`);
        }
        
        return {
            manufacturer: hersteller,
            product: produkt
        };
    }

    parseProdTeil() {
        if (this.peekWord('TBD')) {
            this.position += 3;
            return 'TBD';
        }
        
        const start = this.position;
        while (this.position < this.input.length && this.isUniAlnum(this.input[this.position])) {
            this.position++;
        }
        
        if (this.position > start) {
            return this.input.substring(start, this.position);
        }
        
        return null;
    }

    parseZusatzIDs() {
        const zusaetze = [];
        
        while (this.position < this.input.length) {
            const zusatz = this.parseZusatzID();
            if (zusatz) {
                zusaetze.push(zusatz);
            } else {
                break;
            }
        }
        
        return zusaetze;
    }

    parseZusatzID() {
        const sep = this.parseZSep();
        if (!sep) {
            return null;
        }
        
        const seq = this.parseZSeq();
        if (!seq || seq.length === 0) {
            this.position--;
            return null;
        }
        
        return {
            separator: sep,
            parts: seq
        };
    }

    parseZSep() {
        const char = this.peek();
        if (char === '-' || char === '$' || char === '|') {
            this.position++;
            return char;
        }
        return null;
    }

    parseZSeq() {
        const parts = [];
        
        const firstPart = this.parseZTeil();
        if (!firstPart) {
            return null;
        }
        parts.push(firstPart);
        
        while (this.peek() === '.') {
            this.consume('.');
            const part = this.parseZTeil();
            if (!part) {
                this.position--;
                break;
            }
            parts.push(part);
        }
        
        return parts;
    }

    parseZTeil() {
        const start = this.position;
        while (this.position < this.input.length && this.isUniAlnum(this.input[this.position])) {
            this.position++;
        }
        
        if (this.position > start) {
            return this.input.substring(start, this.position);
        }
        
        return null;
    }

    isUniAlnum(char) {
        return this.isUniLetter(char) || this.isDigit(char);
    }

    isUniLetter(char) {
        return /\p{L}/u.test(char);
    }

    isDigit(char) {
        return char >= '0' && char <= '9';
    }

    peek() {
        if (this.position < this.input.length) {
            return this.input[this.position];
        }
        return null;
    }

    peekAhead(offset) {
        const pos = this.position + offset;
        if (pos < this.input.length) {
            return this.input[pos];
        }
        return null;
    }

    peekWord(word) {
        for (let i = 0; i < word.length; i++) {
            if (this.position + i >= this.input.length || this.input[this.position + i] !== word[i]) {
                return false;
            }
        }
        const nextPos = this.position + word.length;
        if (nextPos < this.input.length) {
            const nextChar = this.input[nextPos];
            if (this.isUniAlnum(nextChar)) {
                return false;
            }
        }
        return true;
    }

    consume(expected) {
        if (this.peek() === expected) {
            this.position++;
            return true;
        }
        return false;
    }

    addError(message) {
        this.errors.push({
            message,
            position: this.position
        });
    }
}

module.exports = GpeidParser;