require('find-java-home')({ allowJre: true }, function(err, home){
  if(err){
    console.error("[node-java] "+err);
    process.exit(1);
  }
  process.stdout.write(home);
});
