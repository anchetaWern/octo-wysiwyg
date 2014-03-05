var initial_text = $('.markdown-container').val();
var publish_regex = /published:\s(true|false)/;
var comments_regex = /comments: (true|false)/;
var update_regex = /updated: [0-9\-]+/;

var publish_matches = initial_text.match(publish_regex);
var comments_matches = initial_text.match(comments_regex);

var title_regex = /title:\s("?.+")/;
var current_text = $('.markdown-container').val();
var title = current_text.match(title_regex);
var keyup_timeout;

var reader = new FileReader();
var markdown_file = document.getElementById('markdown_file');
var image_file = document.getElementById('image_file');

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

function updateHTML(){
	var markdown = $('.markdown-container').val();
	$.post('/update_html', {'markdown' : markdown}, function(response){
		$('.html-container').html(response);
		updateCheckbox();
		prettyPrint();
	});
}

function updateCheckbox(){
	var current_text = $('.markdown-container').val();
	var publish_matches = current_text.match(publish_regex);
	var comments_matches = current_text.match(comments_regex);

	var bool_r = [true, false];
	if(publish_matches){
		$('#publish').prop({'checked' : bool_r[publish_matches[1].length - 4]});
	}

	if(comments_matches){
		$('#comments').prop({'checked' : bool_r[comments_matches[1].length - 4]});
	}
}


function getCurrentValues(){
	var markdown = $('.markdown-container').val();
	var markdown_container = document.getElementsByClassName('markdown-container')[0];

	var cursor_position = getCaret(markdown_container);
	var first_part = markdown.slice(0, cursor_position);
	var second_part = markdown.slice(cursor_position, -1);	

	var current_values = {
		'markdown' : markdown,
		'markdown_container' : markdown_container,
		'first_part' : first_part,
		'second_part' : second_part,
		'cursor_position' : cursor_position
	};

	return current_values;
}

function bold(){			
	var current_values = getCurrentValues();
	
	var bold_value = current_values.first_part + "****" + current_values.second_part;
	$('.markdown-container').val(bold_value);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + 2);
}

function italic(){
	var current_values = getCurrentValues();

	var italic_value = current_values.first_part + "**" + current_values.second_part;
	$('.markdown-container').val(italic_value);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + 1);
}

function quote(){
	var current_values = getCurrentValues();

	$('.markdown-container').val(current_values.first_part + "\n{% blockquote %}\n\n{% endblockquote %}" + current_values.second_part);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + 18);
}

function link(){
	var current_values = getCurrentValues();
	var link_url = $('#link_url').val();
	var link_text = $('#link_text').val();
	var link_value = current_values.first_part + "[" + link_text + "](" + link_url + ")" + current_values.second_part;
	$('.markdown-container').val(link_value);
	$('#link_url, #link_text').val('');
	$('#link-modal').modal('hide');
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + link_url.length + link_text.length + 4);
}

function code(){
	var current_values = getCurrentValues();
	$('.markdown-container').val(current_values.first_part + "``" + current_values.second_part);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + 1);	
}

function multilineCode(){
	var current_values = getCurrentValues();
	$('.markdown-container').val(current_values.first_part + "\n```\n```" + current_values.second_part);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + 4);
}

function image(){
	var current_values = getCurrentValues();
	var image_value = current_values.first_part + " ![]()" + current_values.second_part;
	if(current_values.markdown_container.value.slice(-1) == "\n"){
		image_value = current_values.first_part + "\n![]()" + current_values.second_part;
	}

	$('.markdown-container').val(image_value);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + 5);	
}

function save(){
	var current_values = getCurrentValues();
	$.post('/save_post', {'markdown' : current_values.markdown});
}

function heading(key){
	var current_values = getCurrentValues();
	$('.markdown-container').val(current_values.first_part + "\n" + key + current_values.second_part);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + key.length + 1);	
}

function counter(){
  var i = 1;
  return function(reset){
	if(reset){
		i = 0;
	}
	return i++;
    
  };
}

var ol_counter = counter();

function orderedList(){
	var current_values = getCurrentValues();
	var index = ol_counter();
	var ol_value = current_values.first_part + "\n" + index + ". " + current_values.second_part;
	$('.markdown-container').val(ol_value);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + index.toString().length + 3);
}


function unorderedList(){
	var current_values = getCurrentValues();
	var ul_value = current_values.first_part + "\n- " + current_values.second_part;
	$('.markdown-container').val(ul_value);
	setCaretToPos(current_values.markdown_container, current_values.cursor_position + 3);
}


$(function(){
	prettyPrint();
	updateCheckbox();
	$('.markdown-container').val($.trim($('.markdown-container').val()));

	$('.markdown-container').keyup(function(){
		clearTimeout(keyup_timeout);
		keyup_timeout = setTimeout(function(){
			updateHTML();
		}, 1500);
	});

	$('#post-title').val(title[1]);

	$('#upload').click(function(){
		if(markdown_file.files.length === 0){
			alert("I can't see the invisible file that you're trying to upload");
			return false;
		}
	});

	$('#post-title').keyup(function(){
		var title = $(this).val();
		var current_text = $('.markdown-container').val();
		var new_text = current_text.replace(title_regex, 'title: ' + title);
		$('.markdown-container').val(new_text);
	});

	$('#publish').click(function(){
		var publish = $(this).is(':checked');
		var current_text = $('.markdown-container').val();
		var new_text = current_text.replace(publish_regex, 'published: ' + publish);
		$('.markdown-container').val(new_text);
	});

	$('#comments').click(function(){
		var comments = $(this).is(':checked');
		var current_text = $('.markdown-container').val();
		var new_text = current_text.replace(comments_regex, 'comments: ' + comments);
		$('.markdown-container').val(new_text);
	});

	$('#update').click(function(){
		var update = $(this).is(':checked');
		var current_text = $('.markdown-container').val();

		if(update){
			var today = new Date();
			var month = today.getMonth() + 1;
			if(month < 10){
				month = '0' + month;
			}
			var date = today.getFullYear() + "-" + month + "-" + today.getDate();
			var update_matches = current_text.match(update_regex);
			var new_text;
			if(update_matches){
				new_text = current_text.replace(update_regex, 'updated: ' + date);
			}else{
				var publish_matches = current_text.match(publish_regex);
				new_text = current_text.replace(publish_matches[0], publish_matches[0] + "\n" + 'updated: ' + date);
			}
			$('.markdown-container').val(new_text);
		}
	});

	$(document).bind('keydown', function(e){
		/*
		var markdown = $('.markdown-container').val();
		var markdown_container = document.getElementsByClassName('markdown-container')[0];

		var cursor_position = getCaret(markdown_container);
		var first_part = markdown.slice(0, cursor_position);
		var second_part = markdown.slice(cursor_position, -1);
		*/
		
		//save post (s)
		if(e.ctrlKey && (e.which == 83)){
			e.preventDefault();
			save();
			return false;
		}

		//insert headings
		var keys = {'49' : '#', '50' : '##', '51' : '###', '52' : '####', '53' : '#####', '54' : '######'};
		if(e.ctrlKey && (e.which >= 49 && e.which <= 54)){
			e.preventDefault();
			var key = keys[e.which];
			heading(key);
			return false;
		}

		//insert image (g)
		if(e.ctrlKey && e.which == 71){
			e.preventDefault();
			image();
			return false;
		}

		//bold (b)
		if(e.ctrlKey && e.which == 66){
			e.preventDefault();
			bold();
			return false;
		}

		//italic (i)
		if(e.ctrlKey && e.which == 73){
			e.preventDefault();
			italic();
			return false;
		}

		//blockquote (q)
		if(e.ctrlKey && e.which == 81){
			e.preventDefault();
			quote();
			return false;
		}

		//more (f2)
		if(e.which == 113){
			e.preventDefault();
			$('.markdown-container').val(first_part + "\n<!--more-->\n" + second_part);
			setCaretToPos(markdown_container, cursor_position + 13);
			return false;
		}

		//link (-)
		if(e.ctrlKey && e.which == 189){
			e.preventDefault();
			$('#link-modal').modal('show');
			return false;
		}

		//code (/)
		if(e.ctrlKey && e.which == 220){
			e.preventDefault();
			code();
			return false;
		}

		//multi-line code (f1)
		if(e.which == 112){
			e.preventDefault();
			multilineCode();
			return false;
		}

		//upload modal
		if(e.ctrlKey && e.which == 85){
			e.preventDefault();
			$('#image-upload-modal').modal('show');
			return false;
		}

		//unordered list (k)
		if(e.ctrlKey && e.which == 75){
			e.preventDefault();
			unorderedList();
			return false;
		}

		//ordered list (l)
		if(e.ctrlKey && e.which == 76){
			e.preventDefault();
			orderedList();
			return false;
		}

		//reset counter (r)
		if(e.ctrlKey && e.which == 82){
			e.preventDefault();
			ol_counter(true);
			return false;
		}

	});

	$('#image_file').change(function(){
		var markdown_container = document.getElementsByClassName('markdown-container')[0];
		var markdown = $('.markdown-container').val();

		var cursor_position = getCaret(markdown_container);
		var first_part = markdown.slice(0, cursor_position);
		var second_part = markdown.slice(cursor_position, -1);

		var image_save_path = $('#image_save_path').val();
		var file = image_file.files[0];
		var filename = file.name;
		reader.onload = function(e){
			$.post(
				'/save_image',
				{'image_save_path' : image_save_path, 'data_uri' : reader.result, 'filename' : filename},
				function(response){
					$('.markdown-container').val(first_part + "![](" + response + ")" + second_part);
					setCaretToPos(markdown_container, cursor_position + 2);
					$('#image-upload-modal').modal('hide');
					
					clearTimeout(keyup_timeout);
					keyup_timeout = setTimeout(function(){
						updateHTML();
					}, 1500);
			});
		};

		reader.readAsDataURL(file);
	});

	$('.markdown-container').scroll(function(){
		var scroll_position = $('.markdown-container').scrollTop();
		$('.html-container').scrollTop(scroll_position);
	});

	$('#bold').click(function(){
		bold();
	});

	$('#btn-save').click(function(){
		save();
	});

	$('#btn-italic').click(function(){
		italic();
	});

	$('#btn-link').click(function(){
		$('#link-modal').modal('show');
	});

	$('#btn-insertlink').click(function(){
		link();
	});

	$('#btn-quote').click(function(){
		quote();
	});

	$('#btn-picture').click(function(){
		$('#image-upload-modal').modal('show');
	});

	$('#btn-ol-list').click(function(){
		orderedList();
	});

	$('#btn-ul-list').click(function(){
		unorderedList();
	});

	$('#btn-multilinecode').click(function(){
		multilineCode();
	});

	$('#btn-new').click(function(){
		window.location.href = '/new';
	});

	$('#btn-list').click(function(){
		window.location.href = '/list';
	});

	$('#link_text').keydown(function(e){
		if(e.which == 13){
			e.preventDefault();
			$('#btn-insertlink').trigger('click');
			return false;
		}
	});

	$('#link-modal').on('shown.bs.modal', function(){
		$('#link_url').focus();
	});	

	$('#btn-reset-counter').click(function(){
		ol_counter(true);
	});
});


