function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}

$('.markdown-container').keyup(function(){
	var markdown = $(this).val();
	$.post('/update_html', {'markdown' : markdown}, function(response){
		$('.html-container').html(response);
	});
});

$(document).bind('keydown', function(e){
  var markdown = $('.markdown-container').val();
  var current_text = $.trim($('.markdown-container').val());
  var markdown_container = document.getElementsByClassName('markdown-container')[0];

  if(e.ctrlKey && (e.which == 83)){
    e.preventDefault();
    $.post('/save_post', {'markdown' : markdown});
    return false;
  }

  //insert headings
  var keys = {'49' : '#', '50' : '##', '51' : '###', '52' : '####', '53' : '#####', '54' : '######'};
  if(e.ctrlKey && (e.which >= 49 && e.which <= 54)){
  	e.preventDefault();
	$('.markdown-container').val(current_text + "\n" + keys[e.which]);

  	return false;
  }

  //insert image
  if(e.ctrlKey && e.which == 71){
  	e.preventDefault();
	
  	var new_value = current_text + "![]()";
	if(markdown_container.value.slice(-1) == "\n"){
		new_value = current_text + "\n![]()"
	}

	$('.markdown-container').val(new_value);  
	setCaretToPos(markdown_container, markdown_container.selectionEnd - 1);
	return false;
  }

  //bold
  if(e.ctrlKey && e.which == 66){
  	e.preventDefault();
  	
  	var new_value = current_text + " ****";
  	if(markdown_container.value.slice(-1) == "\n"){
		new_value = current_text + "\n****";
	}

	$('.markdown-container').val(new_value);  
  	setCaretToPos(markdown_container, markdown_container.selectionEnd - 2);
  	return false;
  }

  //italic
  if(e.ctrlKey && e.which == 73){
  	e.preventDefault();
  	
  	var new_value = current_text + " **";
   	if(markdown_container.value.slice(-1) == "\n"){
		new_value = current_text + "\n**";
	} 	

	$('.markdown-container').val(new_value);  
	setCaretToPos(markdown_container, markdown_container.selectionEnd - 1);
  	return false;
  }

  //blockquote
  if(e.ctrlKey && e.which == 81){
  	e.preventDefault();
  	$('.markdown-container').val(current_text + "\n{% blockquote %}\n\n{% endblockquote %}"); 
  	setCaretToPos(markdown_container, markdown_container.selectionEnd - 20);
  	return false;
  }

  //more
  if(e.which == 113){
  	e.preventDefault();
  	$('.markdown-container').val(current_text + "\n<!--more-->\n"); 
  	
  	return false;
  }  

  //multi-line code
  if(e.which == 112){
  	e.preventDefault();	
  	$('.markdown-container').val(current_text + "\n```\n```"); 
  	setCaretToPos(markdown_container, markdown_container.selectionEnd - 4);
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

