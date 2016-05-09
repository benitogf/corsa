#zip all files to nw archive
cp package.json ./platforms/browser/www/
cd platforms/browser/www/
zip -r ../../../corsa.nw ./*
cd ../../../
rm ./platforms/browser/www/package.json
#compilation to executable form
#cat /opt/node-webkit/nw ./corsa.nw > ./platforms/nw/linux64/corsa && chmod +x ./platforms/nw/linux64/corsa
#remove corsa.nw
#rm corsa.nw
#cp /opt/node-webkit/nwjc ./platforms/nw/linux64/
#cp /opt/node-webkit/*.pak ./platforms/nw/linux64/
#cp /opt/node-webkit/*.dat ./platforms/nw/linux64/
#cp -R /opt/node-webkit/lib ./platforms/nw/linux64/lib
#run application
#../build/linux/my-app
