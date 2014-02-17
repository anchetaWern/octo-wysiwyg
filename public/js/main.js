function setSelectionRange(input, selectionStart, selectionEnd){
	if(input.setSelectionRange){
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	}else if(input.createTextRange){
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

function setCaretToPos(input, pos){
	setSelectionRange(input, pos, pos);
}

function getCaret(node){
  if(node.selectionStart){
    return node.selectionStart;
  }else if(!document.selection){
    return 0;
  }

  var c = "\001",
      sel = document.selection.createRange(),
      dul = sel.duplicate(),
      len = 0;

  dul.moveToElementText(node);
  sel.text = c;
  len = dul.text.indexOf(c);
  sel.moveStart('character',-1);
  sel.text = "";
  return len;
}

$('.markdown-container').val($.trim($('.markdown-container').val()));

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

	var cursor_position = getCaret(markdown_container);
	var first_part = markdown.slice(0, cursor_position);
	var second_part = markdown.slice(cursor_position, -1);

	//save post
	if(e.ctrlKey && (e.which == 83)){
		e.preventDefault();
		$.post('/save_post', {'markdown' : markdown});
		return false;
	}

	//insert headings
	var keys = {'49' : '#', '50' : '##', '51' : '###', '52' : '####', '53' : '#####', '54' : '######'};
	if(e.ctrlKey && (e.which >= 49 && e.which <= 54)){
		e.preventDefault();
		$('.markdown-container').val(first_part + "\n" + keys[e.which] + second_part);
		setCaretToPos(markdown_container, cursor_position + keys[e.which].length + 1);
		return false;
	}

	//insert image
	if(e.ctrlKey && e.which == 71){
		e.preventDefault();

		var image_value = first_part + " ![]()" + second_part;
		if(markdown_container.value.slice(-1) == "\n"){
			image_value = first_part + "\n![]()" + second_part;
		}

		$('.markdown-container').val(image_value);
		setCaretToPos(markdown_container, cursor_position + 5);
		return false;
	}

	//bold
	if(e.ctrlKey && e.which == 66){
		e.preventDefault();

		var bold_value = first_part + " ****" + second_part;
		if(markdown_container.value.slice(-1) == "\n"){
			bold_value = first_part + "\n****" + second_part;
		}

		$('.markdown-container').val(bold_value);
		setCaretToPos(markdown_container, cursor_position + 3);
		return false;
	}

	//italic
	if(e.ctrlKey && e.which == 73){
		e.preventDefault();

		var italic_value = first_part + " **" + second_part;
			if(markdown_container.value.slice(-1) == "\n"){
			italic_value = first_part + "\n**" + second_part;
		}

		$('.markdown-container').val(italic_value);
		setCaretToPos(markdown_container, cursor_position + 2);
		return false;
	}

	//blockquote
	if(e.ctrlKey && e.which == 81){
		e.preventDefault();
		$('.markdown-container').val(first_part + "\n{% blockquote %}\n\n{% endblockquote %}" + second_part);
		setCaretToPos(markdown_container, cursor_position + 20);
		return false;
	}

	//more
	if(e.which == 113){
		e.preventDefault();
		$('.markdown-container').val(first_part + "\n<!--more-->\n" + second_part);
		setCaretToPos(markdown_container, cursor_position + 13);
		return false;
	}

	//multi-line code
	if(e.which == 112){
		e.preventDefault();
		$('.markdown-container').val(first_part + "\n```\n```" + second_part);
		setCaretToPos(markdown_container, cursor_position + 4);
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
		$.post(
			'/save_image',
			{'image_save_path' : image_save_path, 'data_uri' : reader.result, 'filename' : filename},
			function(response){
				var current_text = $.trim($('.markdown-container').val());
				$('.markdown-container').val(current_text + $.trim(response));
		});
	};

	reader.readAsDataURL(file);
});

