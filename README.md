# README #

* demo-encoder can take an input video from the client's file system, transcode it in the cloud, and upload to cloud storage.
* Version 1.0

## How do I get set up? ##

* Install node.js, and npm.js: [Node](https://nodejs.org/en/) or from homebrew on mac: [Homebrew](http://brew.sh/)
* Install bower and run yarn or npm install
* $ npm install -g bower
* $ npm install
* $ bower install
* Update **/src/config/config.ts with your aws access key and secret key for S3 uploading. Along with your bento4/bin path and path to your local media file**
* Update the *bucketName* value in **/src/config/config.ts** with your s3 bucket name
* Turn local cleanup on/off with the cleanup value in **/src/config/config.ts**
* To get signed URLs from bucket storage, use the signedUrls value in **/src/config/config.ts**
* $ npm run clean
* $ npm run compile
* You can watch for changes in your code with $ npm run watch

## How do I run the app? ##

### On mac ###
* Run with $ npm run nodemon
* Or with $ npm start

### On windows ###
* Same as mac, or...
* Run the app with node .dist/bin/www.js

### Go to http://localhost:3000 in a browser. ###



*You can encode a video with the default setting by only selecting a video and not changing any of the options on the web form*

## App Overview ##
* Entry point of the encoder is in **src/control/workflow.ts** in the **initWorkflow** function.
* The workflow is constructed with an array of functions in **setWorkflow** in **workflow.ts**
* Encoding processes, file system processes, and storage upload processes are designated to their own respective files in the **src/processes** directory
* All client code is in the **client** directory, and is a very rough bootstrap design with a single ajax form.
* Workflow status is polled, and accesses the javascript object in **src/control/status.ts**
* All workflow specific values are stored in the **options,** which are passed through the application until completion.

## Contact ##

* realeyes.com
* https://github.com/realeyes-media/demo-encoder