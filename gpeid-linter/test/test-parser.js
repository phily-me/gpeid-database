const GpeidParser = require('../src/parser');

const parser = new GpeidParser();

const testCases = [
    {
        input: '=Gebäude1+HLK_Sensor.001:Siemens.ABC123',
        expected: { valid: true },
        description: 'Basic valid gpEID with German characters'
    },
    {
        input: '=Building.Floor2.Room3+HLK.VEN.TMP_Controller.042:Honeywell.T6Pro',
        expected: { valid: true },
        description: 'Complex valid gpEID with multiple hierarchy levels'
    },
    {
        input: '=Site1..Room5+TBD.HLK_TBD.TBD.005:TBD.TBD',
        expected: { valid: true },
        description: 'Valid gpEID with TBD placeholders and gaps'
    },
    {
        input: '=Haus+HLK_Sensor.001:Siemens.Model-Config.v1$Serial.12345|Test.abc',
        expected: { valid: true },
        description: 'Valid gpEID with multiple extensions'
    },
    {
        input: '=Building+HLK_123.001:Vendor.Product',
        expected: { valid: false },
        description: 'Invalid: Type part cannot be pure numbers'
    },
    {
        input: '=Building+hlk_Sensor.001:Vendor.Product',
        expected: { valid: false },
        description: 'Invalid: Function must be 3 uppercase letters'
    },
    {
        input: '=Building+HLK_Sensor.000:Vendor.Product',
        expected: { valid: false },
        description: 'Invalid: Counter cannot be 000'
    },
    {
        input: '=Building+HLK_Sensor.99:Vendor.Product',
        expected: { valid: false },
        description: 'Invalid: Counter must be exactly 3 digits'
    },
    {
        input: '=TBD+HLK_Sensor.001:Vendor.Product',
        expected: { valid: false },
        description: 'Invalid: Liegenschaft cannot be TBD'
    },
    {
        input: '=Building+HLK_Sensor.001:Vendor',
        expected: { valid: false },
        description: 'Invalid: Product must have two parts'
    },
    {
        input: 'Building+HLK_Sensor.001:Vendor.Product',
        expected: { valid: false },
        description: 'Invalid: Missing = prefix'
    },
    {
        input: '=Building+HLK.ABC_Sensor.001:Vendor.Product',
        expected: { valid: true },
        description: 'Valid: Multiple function parts with 3-letter codes'
    },
    {
        input: '=Büro.Süd+HLK_Wärme.001:Müller.Gerät',
        expected: { valid: true },
        description: 'Valid: Full Unicode support including umlauts'
    }
];

console.log('Running gpEID Parser Tests\n' + '='.repeat(50) + '\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    const result = parser.parse(testCase.input);
    const success = result.valid === testCase.expected.valid;
    
    if (success) {
        console.log(`✓ Test ${index + 1}: ${testCase.description}`);
        console.log(`  Input: ${testCase.input}`);
        if (result.valid && result.parsed) {
            console.log(`  Parsed components:`);
            console.log(`    - Location: =${result.parsed.ortsID.join('.')}`);
            console.log(`    - Function: +${result.parsed.funktionsID.join('.')}`);
            console.log(`    - Type: _${result.parsed.typID.core.join('.')}.${result.parsed.typID.counter}`);
            console.log(`    - Product: :${result.parsed.produktID.manufacturer}.${result.parsed.produktID.product}`);
            if (result.parsed.zusatzIDs.length > 0) {
                console.log(`    - Extensions: ${result.parsed.zusatzIDs.map(z => z.separator + z.parts.join('.')).join(' ')}`);
            }
        }
        passed++;
    } else {
        console.log(`✗ Test ${index + 1}: ${testCase.description}`);
        console.log(`  Input: ${testCase.input}`);
        console.log(`  Expected valid: ${testCase.expected.valid}, Got valid: ${result.valid}`);
        if (result.errors.length > 0) {
            console.log(`  Errors: ${result.errors.map(e => e.message).join(', ')}`);
        }
        failed++;
    }
    console.log();
});

console.log('='.repeat(50));
console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('✓ All tests passed!');
    process.exit(0);
} else {
    console.log('✗ Some tests failed');
    process.exit(1);
}