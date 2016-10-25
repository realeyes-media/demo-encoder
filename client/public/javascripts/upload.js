$(function(){
    var $select = $("#1-100");
    for (i=1;i<=100;i++){
        if (i === 8) {
          $select.append($('<option selected></option>').val(i).html(i))
        } else {
          $select.append($('<option></option>').val(i).html(i))
        }
    }
});