require 'sinatra'
require 'redcarpet'
require 'stringex'
require 'data_uri'
require 'git'
require 'json'

load 'config.rb'

enable :sessions

def blockquote(html)
	html.gsub! '{% blockquote %}', '<blockquote>'
	html.gsub! '{% endblockquote %}', '</blockquote>'
	html
end


def render_markdown(text)
	rnder = Redcarpet::Render::HTML.new(:prettify => true)
	markdown = Redcarpet::Markdown.new(rnder, :autolink => true, :fenced_code_blocks => true)
	html = markdown.render(text)

	@old_paths = html.scan(/src="((?:\w|\.|\/|_|-)+)"/)
	@new_paths = html.gsub(/<img src="((?:\w|\.|\/|_|-)+)"?.+>/, $public_dir + '\1').split(/ /)

	@old_paths.each_with_index do |item, index|
		relative_source = item.to_s.gsub(/\"/, '').gsub(/[\[\]]/, '')
		source = $octopress_source_dir + relative_source
		basename = File.basename(source);
		@path = relative_source.gsub(basename, '')
		dir_name = @path.gsub($images_dir, '')

		new_dir = 'public/tmp' + $images_dir + dir_name
		if !File.directory?('public/tmp' + $images_dir)
			FileUtils.mkdir('public/tmp' + $images_dir)
		end	

		if !File.directory?(new_dir)
			FileUtils.mkdir(new_dir)
		end

		dest_file = $public_dir + '/tmp' + $images_dir +  dir_name + '/' + basename
		if !File.exist?(dest_file)
			FileUtils.cp(source, dest_file)
		end	
		
		html = html.gsub(relative_source, '/tmp' + $images_dir +  dir_name + basename)	
	end	
	html = blockquote(html)
	@html_content = html
	@markdown_content = text

	content_r = {'html' => @html_content, 'markdown' => @markdown_content}
	content_r
end

get '/' do
	@has_content = false
	erb :jet
end

get '/edit/:post' do
	@has_content = false
	
	if !params[:post].nil?
	
		#delete previously upload files
		Dir.foreach('uploads/') do |item|
			next if item == '.' or item == '..'
			File.delete('uploads/' + item)
		end

		source_file = $posts_dir + '/' + params[:post]
		dest_file = $root_dir + '/uploads/' + params[:post]
		if !File.exist?(dest_file)
			FileUtils.cp(source_file, dest_file)
			session['current_file'] = params[:post]
		end
		

		if !session['current_file'].nil? && !session['current_file'].empty?
			@current_file = 'uploads/' + session['current_file']
			@content = ''
			@text = ''
			if File.exist?(@current_file)
				@has_content = true
				@image_save_path = session['current_file'].gsub('.markdown', '');
				File.readlines(@current_file).each do |line|
					@text += line
				end

				content_r = render_markdown(@text)
				@html_content = content_r['html']
				@markdown_content = content_r['markdown']
			end
		end
	end
	erb :jet
end


post "/save_image" do
	file_path = $octopress_source_dir + $images_dir + '/' + params[:image_save_path]
	#create directory in the source
	if !File.directory?(file_path)
		FileUtils.mkdir(file_path)
	end

	filename = file_path + '/' + params[:filename]
	uri = URI::Data.new(params[:data_uri])
	File.write(filename, uri.data)

	image_path = filename.gsub($octopress_source_dir, '')

	#copy into the public directory
	dest_path = $root_dir + '/public/tmp' + $images_dir + '/' + params[:image_save_path]
	if !File.directory?(dest_path)
		FileUtils.mkdir(dest_path)
	end

	dest_file = $root_dir + '/public/tmp' + image_path
	if !File.exist?(dest_file)
		FileUtils.cp(filename, dest_file) 
	end	
	dest_path
	image_path
end


post "/save_post" do
	@current_file = 'uploads/' + session['current_file']
	File.open(@current_file, 'w') { |file| file.write(params[:markdown]) }
	FileUtils.copy(@current_file,  $posts_dir + '/' + session['current_file'])
end

post "/update_html" do
	content_r = render_markdown(params[:markdown])
	content_r['html']
end

post "/upload" do 
	if !params['markdown_file'].nil?
		
		filename = params['markdown_file'][:filename]
		is_markdown = filename[/\.markdown/]
		if is_markdown != nil

			#delete previously upload files
			Dir.foreach('uploads/') do |item|
				next if item == '.' or item == '..'
				File.delete('uploads/' + item)
			end

			#upload the new markdown file
			File.open('uploads/' + filename, "w") do |f|
				f.write(params['markdown_file'][:tempfile].read)
				session['current_file'] = filename
			end

			redirect '/edit/' + filename
		else
			"Please upload a .markdown file"
		end
	end
end


get '/new' do 
	erb :new_post
end

post '/new' do
	title = params[:title]
	filename = "#{Time.now.strftime('%Y-%m-%d')}-#{title.to_url}.markdown"
	file_path = "#{$posts_dir}/" + filename
	open(file_path, 'w') do |post|
		post.puts "---"
		post.puts "layout: post"
		post.puts "title: \"#{title.gsub(/&/,'&amp;')}\""
		post.puts "date: #{Time.now.strftime('%Y-%m-%d %H:%M')}"
		post.puts "comments: true"
		post.puts "categories: "
		post.puts "published: false"
		post.puts "---"
	end	

	Dir.foreach('uploads/') do |item|
		next if item == '.' or item == '..'
		File.delete('uploads/' + item)
	end

	dest_file = 'uploads/' + filename

	File.open(dest_file, "w") do |f|
		FileUtils.copy(file_path, dest_file)
		session['current_file'] = filename
	end	

	redirect '/edit/' + filename 
end

get '/list' do
	@posts = []
	Dir.foreach($posts_dir) do |item|
		title = ''
		date = ''
		if item != '.' && item != '..'
			counter = 0
			current_file = $posts_dir + '/' + item
			File.readlines(current_file).each do |line|
				if counter == 2
					title += line.strip[8..-2]
				end
				if counter == 3
					date += line.strip[6..-7]
					break
				end
				counter += 1
			end

			@posts.push({:title => title, :date => date, :path => item})
		end
	end
	@posts = @posts.sort_by{|p| p[:date] }.reverse
	
	@posts
	erb :list_posts
end


get '/git' do
	@untracked_files = []
	@changed_files = []
	g = Git.open($octopress_dir, :log => Logger.new(STDOUT))
	g.status.untracked.each do |file|
		filename = file[0].to_s
		if filename.include? "source" + $images_dir or filename.include? "source/_posts"
			@untracked_files.push(filename)
		end
	end

	g.status.changed.each do |file|
		filename = file[0].to_s
		@changed_files.push(filename)
	end

	@untracked_files
	@changed_files
	erb :git
end

post '/commit' do
	response = {}
	g = Git.open($octopress_dir, :log => Logger.new(STDOUT))
	files = params[:files]
	g.add(files)
	if g.commit(params[:commit_message])
		response = {:type => "success", :message => "files were successfully commited!"}
	else
		response = {:type => "error", :message => "there was an error commiting the files!"}
	end
	response.to_json
end