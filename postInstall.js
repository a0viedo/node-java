var fs = require('fs');
var os = require('os');
var glob = require('glob');
var path = require('path');
var pathDelimeterNode0_8 = (os.platform()==='win32')  ? ";" : ":";

if (os.platform()==='win32') {

    fs.writeFileSync(
        path.resolve(__dirname, './build/jvm_dll_path.json'),
        JSON.stringify(
            (path.delimiter || pathDelimeterNode0_8) +
            path.join(__dirname, "build", "Release")
        )
    );

} else {

    require('find-java-home')( function(err, home){
        var dylib;
        var so;
        var binary;

        if(home) {
            so = glob.sync('**/libjvm.so', {cwd: home})[0];
            dylib = glob.sync('**/libjvm.dylib', {cwd: home})[0];
            binary = dylib || so;

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
}