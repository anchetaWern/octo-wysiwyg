$('.markdown-container').keyup(function(){
	var markdown = $(this).val();
	$.post('/update_html', {'markdown' : markdown}, function(response){
		$('.html-container').html(response);
	});
});

$(document).bind('keydown', function(e){
  var markdown = $('.markdown-container').val();
  if(e.ctrlKey && (e.which == 83)) {
    e.preventDefault();
    $.post('/save_post', {'markdown' : markdown}, function(response){
    	console.log(response);
    });
    return false;
  }
});



var reader = new FileReader();

var image_file = document.getElementById('image_file');

$('#image_file').change(function(){
	var image_save_path = $('#image_save_path').val();
	var file = image_file.files[0];
	var filename = file.name;
	reader.onload = function(e){
		
		$.post('/save_image', {'image_save_path' : image_save_path, 'data_uri' : reader.result, 'filename' : filename}, function(response){
			var current_text = $.trim($('.markdown-container').val());
			$('.markdown-container').val(current_text + $.trim(response));
		});
		
	}

	reader.readAsDataURL(file); 
});

