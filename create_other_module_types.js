/* eslint-disable max-len */
const fs = require('fs');

fs.readFile('joy.js', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    fs.writeFile('joy.mjs', data + '\nexport default JoyStick;\n', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
    fs.writeFile('joy.cjs', data + '\nmodule.exports = JoyStick;\n', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
});

fs.readFile('joy.min.js', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    fs.writeFile('joy.min.mjs', data + '\nexport default JoyStick;\n', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
    fs.writeFile('joy.min.cjs', data + '\nmodule.exports = JoyStick;\n', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
});
