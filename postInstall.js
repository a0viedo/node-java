var fs = require('fs');
var os = require('os');
var glob = require('glob');
var path = require('path');
var os   = require('os');

var pathDelimeterNode0_8 = (os.platform()==='win32')  ? ";" : ":";

require('find-java-home')({ allowJre: true  }, function (err, home){
    if (err) {
        console.log("Couldn't find JAVA");
        console.log(err);
        process.exit(1)
    }
    
    var dll;
    var dylib;
    var so,soFiles;
    var binary;

    if(home) {
        dll = glob.sync('**/jvm.dll', {cwd: home})[0];
        dylib = glob.sync('**/libjvm.dylib', {cwd: home})[0];
        soFiles = glob.sync('**/libjvm.so', {cwd: home});
        
        if(soFiles.length>0)
          so = getCorrectSoForPlatform(soFiles);

        binary = dll || dylib || so;

        if (!binary) {
            console.log("\n\nJAVA runtime is missing.");
            process.exit(1);
        }
        
        if (!fs.existsSync(path.resolve(__dirname, './build/')))  {
            fs.mkdirSync(path.resolve(__dirname, './build/'));
        }

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

function getCorrectSoForPlatform(soFiles){
  var so = _getCorrectSoForPlatform(soFiles);
  if (so) {
    so = removeDuplicateJre(so);
  }
  return so;
}

function removeDuplicateJre(filePath){
  while(filePath.indexOf('jre/jre')>=0){
    filePath = filePath.replace('jre/jre','jre');
  }
  return filePath;
}

function _getCorrectSoForPlatform(soFiles){
  
  var architectureFolderNames = {
    'ia32': 'i386',
    'x64': 'amd64'
  };

  if(os.platform() != 'sunos')
    return soFiles[0];

  var requiredFolderName = architectureFolderNames[os.arch()];

  for (var i = 0; i < soFiles.length; i++) {
    var so = soFiles[i];

    if(so.indexOf('server')>0)
      if(so.indexOf(requiredFolderName)>0)
        return so;
  }

  return soFiles[0];
}
