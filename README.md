octo-wysiwyg
============

Markdown to HTML UI for Octopress. This project attempts to make it easier to compose new blog posts by providing keyboard shortcuts for common markdown syntax. It also makes inserting of images to a post easier. Images will be automatically copied into the Octopress image source directory of your choice and the markdown syntax is automatically generated for you. Lastly an HTML preview is also generated as you type.

###Dependencies

This application depends on the following ruby gems:

- sinatra
- redcarpet
- data_uri
- stringex
- git (git should also be installed)

It also uses the following for presentation and event-handling:

- jquery
- twitter bootstrap
- google-code-prettify

###How to Install

Copy it anywhere on your file system. Then update the `config.rb` to include the proper file paths.


###How to use

Execute the following command from the terminal:

```
ruby /path/to/octo-wysiwyg/octo-wysiwyg.rb
```

Or if you want to use [shotgun](http://rubygems.org/gems/shotgun):

```
shotgun /path/to/octo-wysiwyg/octo-wysiwyg.rb
```

Then access it from the browser when using Sinatra:

```
http://localhost:4567
```

Or shotgun:

```
http://localhost:9393
```

####Updating Existing Posts

To update an existing octopress post simply browse for the markdown file under the `octopress/source/_posts` directory then click 'upload'. Then press `ctrl + s` to save the changes.


####Creating a New Post

Access the following url from the browser, then provide the title of the post then click 'create post':

```
http://localhost:9393/new
```

###Adding Images

Images can be added by clicking on the 'browse image' button. It will be automatically copied to the octopress image directory that you supplied on the `config.rb` file and to the octo-wysiwyg image directory so the image can be viewed from the HTML preview. It will also append the corresponding markdown text to link the image.


###Version Control

To easily manage updates in blog posts a version control feature is also available. It can be accessed by going to `http://localhost:9393/git`. This allows adding of files into the staging area and automatically commiting them.


###What this app is not

This app isn't meant to replace octopress, its just a UI that sits on top of octopress to make common writing tasks easier. Things like creating a new post, editing it and managing updates. You would still need to execute `rake gen_deploy` from the command line if you want to publish your blog or `git diff` if you want to know what has changed in your blog posts. 


###Keyboard Shortcuts

- `ctrl + s` - save post
- `ctrl + 1` to `ctrl + 6` - headings 1 to 6
- `f1` - code block
- `/` - code
- `-` - link
- `f2` - read more link
- `ctrl + b` - bold
- `ctrl + i` - italic
- `ctrl + q` - blockquote
- `ctrl + u` - upload image - this will prompt you to upload an image, the uploaded image will be automatically added on the current document and the uploaded image will be copied over to the octopress image directory that you selected

- `ctrl + p` - main settings
- `ctrl + r` - reset counter
- `ctrl + k` - unordered list
- `ctrl + l` - ordered list


###Screenshot

![octo-wysiwyg](/img/m2html.png)
