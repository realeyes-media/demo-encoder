var status;
$('#upload').submit(function (e) {
  var fd = new FormData();
  fd.append('file', $('input#input-1')[0].files[0]);
  var other_data = $('form#upload').serializeArray();
  $.each(other_data, function (key, input) {
    fd.append(input.name, input.value);
  });

  $.ajax({
    url: 'http://localhost:3000/',
    data: fd,
    processData: false,
    contentType: false,
    type: 'POST',
    success: function (data) {
      console.log(data);
      var statusURI = data.statusURI;
      pollStatus(statusURI);
      $('#status').html('<li class="list-group-item">Uploading video</li>');
    },
    error: function (error) {
      console.log(error);
      $('#status').html('<li class="list-group-item">Please select a file to upload</li>');
    }
  });

  e.preventDefault();
});

$("#upload-button").click(function () {
  $("#upload").submit();
  $('#complete').html('');
});

$(function () {
  var $select = $("#1-100");
  for (i = 1; i <= 100; i++) {
    if (i === 8) {
      $select.append($('<option selected></option>').val(i).html(i))
    } else {
      $select.append($('<option></option>').val(i).html(i))
    }
  }
});

function pollStatus(statusURI) {
  var pollingInterval = 100;
  $.get('http://localhost:3000/status/poll/' + statusURI, function (data) {
    console.log(data);
    if (data.complete) {
      console.log('finished polling');
      if (data.error) {
        $('#status').html('<li class="list-group-item">' + data.status + '</li>');
        $('#complete').html('Encode workflow finished with errors');
      } else {
        var html = "";
        for (var i = 0; i < data.status.length; i++) {
          html += '<li class="list-group-item">' + data.status[i] + '</li>';
        }
        $('#status').html(html);
        $('#complete').html('Encode workflow finished');
      }
      console.log('loading iframes',data.insights)
     
      $('.iframe-child1').attr('src', data.insights[0])
      $('.iframe-child2').attr('src', data.insights[1])
      $('.disabled').removeClass('disabled')
      $('.insights').attr('href','#insights')
    } else if (data.status != status) {
      status = data.status;
      $('#status').html('<li class="list-group-item">' + data.status + '</li>');
      setTimeout(function () {
        pollStatus(statusURI);
      }, pollingInterval);
    } else {
      setTimeout(function () {
        pollStatus(statusURI);
      }, pollingInterval);
    }
  });
}
$(document).ready(function() {
  jQuery('.tabs .tab-links a').on('click', function(e) {
    if(e.currentTarget.parentNode.className.indexOf('disabled') === -1){
      var currentAttrValue = jQuery(this).attr('href')
      console.log('currentAttrValue', currentAttrValue)
      jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
      
      jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
    }
    e.preventDefault();
  });
});