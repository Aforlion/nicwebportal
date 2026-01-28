const fs = require('fs');
const mammoth = require('mammoth');

mammoth.extractRawText({ path: "NIC_Founding_Members_Final.docx" })
    .then(function (result) {
        var text = result.value; // The raw text
        var messages = result.messages;
        console.log(text);
    })
    .catch(function (error) {
        console.error(error);
    });
