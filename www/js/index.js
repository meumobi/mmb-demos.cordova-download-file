/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

var imageURL = 'https://afktravel.com/wp-content/uploads/2015/08/table-mountain-ocean.jpg';
//URL of our asset
var assetURL = 'http://ri.magazineluiza.com.br/Download.aspx?Arquivo=hl4V5aRAzWNpviU2JAyLkQ==';

//File name of our important data file we didn't ship with the app
var fileName = 'magaludatafile.pdf';

var MediaStorage = {
  options: {
    localDownloadFolder: 'Download',
    cordovaFilesystemRoot: null,
  },
  attributes: {},
};

async function onDeviceReady() {
  // Cordova is now initialized. Have fun!

  MediaStorage.options.cordovaFilesystemRoot = cordova.file.externalDataDirectory; // ends in '/'

  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
  console.log(cordova);

  document.getElementById('deviceready').classList.add('ready');

  var onSuccessGetDownloadDirectory = function (dirEntry) {
    MediaStorage.attributes.dirEntry = dirEntry;
    console.log('MediaStorage.attributes.dirEntry: ', dirEntry);
  };

  var onErrorGetDownloadDirectory = function (error) {
    console.error('onErrorLoadFs', error); // FileError.PATH_EXISTS_ERR
  };

  await createDownloadDirectory(MediaStorage.options.cordovaFilesystemRoot, MediaStorage.options.localDownloadFolder)
    .then(onSuccessGetDownloadDirectory)
    .catch(onErrorGetDownloadDirectory);
  init();
}

function createDownloadDirectory(rootPath, dirName) {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(
      rootPath,
      function (rootEntry) {
        // Parameters passed to getDirectory create a new directory or return the directory if it already exists.
        rootEntry.getDirectory(
          dirName,
          { create: true, exclusive: false },
          function (dirEntry) {
            resolve(dirEntry);
          },
          function (error) {
            reject(error);
          }
        );
      },
      function (error) {
        console.log(error);
        reject(error);
      }
    );
  });
}

function checkAndDownload() {
  // Parameters passed to getFile create a new file or return the file if it already exists.
  // dirEntry.getFile(fileName, { create: true, exclusive: false }, _gotFS, onErrorLoadFs);
}

function init() {
  $downloadAssetStatus = document.querySelector('#download-asset-status');
  $fetchImageStatus = document.querySelector('#fetch-image-status');

  $downloadAssetStatus.innerHTML = '[Download asset] Checking for data file.';
  $fetchImageStatus.innerHTML = '[Fetch image] Checking for data file.';

  if (MediaStorage.attributes.dirEntry?.isDirectory) {
    download(MediaStorage.attributes.dirEntry.nativeURL, assetURL); // nativeURL ends in '/'
  } else {
    $downloadAssetStatus.innerHTML = `[Download asset] Can\'t access download folder '${
      MediaStorage.options.cordovaFilesystemRoot + MediaStorage.options.localDownloadFolder
    }'`;
  }
}

function download(dirPath, uri) {
  var fileTransfer = new FileTransfer();
  console.log('About to start transfer');

  fileTransfer.download(
    uri,
    dirPath + getFileName(uri),
    (entry) => {
      console.log(entry);
      console.log('[Download asset] Success!');
      appStart();
    },
    (err) => {
      console.dir(err);
    }
  );
}

function getFileName(url) {
  return md5(url);
}

function fetchImage() {
  const fileName = 'visit-cape-town.jpg';
  const filePromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cordova.plugin.http.downloadFile(
      imageURL,
      {},
      { Accept: '*' },
      MediaStorage.options.cordovaFilesystemRoot + fileName,
      (entry) => {
        resolve(entry.nativeURL);
      },
      (response) => {
        reject(response.error);
      }
    );
  });
  filePromise
    .then((res) => {
      console.log(res); //fileUri
      $fetchImageStatus.innerHTML = '[Fetch image] App ready!';
    })
    .catch((err) => console.log(err));
}

function listDownloadedFiles() {
  // window.resolveLocalFileSystemURL(MediaStorage.options.cordovaFilesystemRoot)
}

//I'm only called when the file exists or has been downloaded.
function appStart() {
  $downloadAssetStatus.innerHTML = '[Download asset] App ready!';
}
