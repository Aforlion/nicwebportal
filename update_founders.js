const fs = require('fs');
const mammoth = require('mammoth');

mammoth.extractRawText({ path: "NIC_Founding_Members_Final.docx" })
    .then(function (result) {
        const text = result.value;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        const names = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check if line is a number (integer)
            if (/^\d+$/.test(line)) {
                // The NEXT line is the name
                if (i + 1 < lines.length) {
                    const name = lines[i + 1];
                    // Verify name isn't just a number or empty (basic sanity check)
                    if (name && !/^\d+$/.test(name)) {
                        names.push(name);
                    }
                }
            }
        }

        // Remove duplicates and sort
        const uniqueNames = [...new Set(names)].sort();

        const fileContent = `export const NIC_FOUNDERS = [
    "${uniqueNames.join('",\n    "')}"
];
`;

        fs.writeFileSync('src/constants/founders.ts', fileContent);
        console.log(`Updated src/constants/founders.ts with ${uniqueNames.length} names.`);

    })
    .catch(function (error) {
        console.error(error);
    });
