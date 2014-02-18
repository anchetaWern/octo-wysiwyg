octo-wysiwyg
============

Markdown to HTML UI for Octopress. This project attempts to make it easier to compose new blog posts by providing keyboard shortcuts for common markdown syntax. It also makes inserting of images to a post easier. Images will be automatically copied into the Octopress image source directory of your choice and the markdown syntax is automatically generated for you. Lastly an HTML preview is also generated as you type.

###Dependencies

This application depends on the following ruby gems:

- sinatra
- redcarpet
- data_uri
- stringex

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


###Keyboard Shortcuts

- `ctrl + s` - save post
- `ctrl + 1` to `ctrl + 6` - headings 1 to 6
- `f1` - code block
- `f2` - read more link
- `ctrl + b` - bold
- `ctrl + i` - italic
- `ctrl + q` - blockquote
- `ctrl + g` - insert markdown image tag
- `ctrl + u` - upload image - this will prompt you to upload an image, the uploaded image will be automatically added on the current document and the uploaded image will be copied over to the octopress image directory that you selected

###Screenshot

![octo-wysiwyg](/img/m2html.png)

###TODO

- keyboard shortcuts for common plugins (image tag, video tags, and other plugins from [here](https://github.com/imathis/octopress/tree/master/plugins))
- line numbers for markdown