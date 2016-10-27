# README #

* demo-encoder can take an input video from the client's file system, transcode it in the cloud, and upload to cloud storage.
* Version 1.0

### How do I get set up? ###

* Install node.js, and npm.js: [Node](https://nodejs.org/en/) or from homebrew on mac: [Homebrew](http://brew.sh/)
* Install bower and run npm install
* $ npm install -g bower
* $ npm install
* $ bower install
* Update /server/config/aws-config.json.template with your aws access key and secret key for S3 uploading. Then rename the file to aws-config.json
* Update the *bucketName* value in /server/config/configuration.json with your s3 bucket name
* Turn local cleanup on/off with the cleanup value in /server/config/configuration.json

### How do I run the app? ###

## On mac ##
* Run project with $ npm start
## On windows ##
* Set your DEBUG environment variable to demo-encoder:*  (set DEBUG=demo-encoder:*)
* Run the app with node ./bin/www

### Go to http://localhost:3000 in a browser. ###



*You can encode a video with the default setting by only selecting a video and not changing any of the options on the web form*

### Contact ###

* realeyes.com
* https://github.com/realeyes-media/demo-encoder