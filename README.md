octo-wysiwyg
============

Markdown to HTML UI for Octopress.

###Dependencies

This application depends on the following ruby gems:

- sinatra
- redcarpet
- data_uri
- stringex

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


###TODO

- more keyboard shortcuts (creating headings, adding tags)
- line numbers for markdown
- auto-scroll - the HTML preview should auto-scroll when scrolling the markdown
- syntax highlighting for code displayed in the HTML preview