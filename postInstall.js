var fs = require('fs');
var os = require('os');
var glob = require('glob');
var path = require('path');
var pathDelimeterNode0_8 = (os.platform()==='win32')  ? ";" : ":";

require('find-java-home')( function(err, home){
    var binary;

    if(home) {
        binary = 
            glob.sync('**/jvm.dll', {cwd: home})[0] ||
            glob.sync('**/libjvm.so', {cwd: home})[0] ||
            glob.sync('**/libjvm.dylib', {cwd: home})[0];

        fs.writeFileSync(
            path.resolve(__dirname, './build/jvm_dll_path.json'),
            binary
            ? JSON.stringify(
                (path.delimiter || pathDelimeterNode0_8)
                + path.dirname(path.resolve(home, binary))
                )
            : '""'
        );
    }
});
