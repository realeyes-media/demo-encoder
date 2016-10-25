// var form = document.getElementById('upload');
// var fileSelect = document.getElementById('input-1');
// var uploadButton = document.getElementById('upload-button');

// form.onsubmit = function(event) {
//   event.preventDefault();

//   // Update button text.
//   uploadButton.innerHTML = 'Uploading...';

//   // The rest of the code will go here...
//   // Get the selected files from the input.
//   var file = fileSelect.files[0];

//   var formData = new FormData();
//   formData.append('video', file, file.name);

//   var xhr = new XMLHttpRequest();
//   xhr.open('POST', '/', true)

//   xhr.onload = function() {
//     if (xhr.status === 200) {
//       uploadButton.innerHTML = 'Upload';
//     } else {
//       alert('An error occurred');
//     }
//   }
//   xhr.send(formData);
// }