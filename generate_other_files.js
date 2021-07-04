/* eslint-disable max-len */
const fs = require('fs');
const { minify } = require('terser');

// Define the config for how Terser should minify the code
// This is set to how you currently have this web tool configured
const config = {
  compress: {
    dead_code: true,
    drop_console: false,
    drop_debugger: true,
    keep_classnames: false,
    keep_fargs: true,
    keep_fnames: false,
    keep_infinity: false
  },
  mangle: {
    eval: false,
    keep_classnames: false,
    keep_fnames: false,
    toplevel: false,
    safari10: false
  },
  module: false,
  sourceMap: false,
  output: {
    comments: 'some'
  }
};

fs.readFile('joy.js', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    // Minify the code with Terser
    (async() => {
        const minified = await minify(data, config);
        // Save the code!
        fs.writeFileSync('joy.min.js', data.split("class JoyStick {")[0].trim() + "\n" + minified.code);
    })();
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
    fs.writeFile('joy.min.mjs', data + '\nexport default JoyStick;', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
    fs.writeFile('joy.min.cjs', data + '\nmodule.exports = JoyStick;', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
});
