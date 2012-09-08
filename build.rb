#!/bin/ruby

require "erb"

SRC_PATH="lib/"
GM_PATH="greasemonkey/"
RAILS_PATH="rails/plugin/"
EXTENSION_PATH="extension/"
TEMPLATES_PATH="lib/templates/"

# TODO: deprecate this methods!!

module Tools
  # Removes old contents and sets this
  def init_file ( from, to)
    dst = File.join( $dst_folder_ctx, to)
    `cp -f #{from} #{dst}`
  end

  # Appends content to this file.
  def append_file( from, to)
    dst = File.join( $dst_folder_ctx, to)
    `cat #{from} >> #{dst}`
  end

  # To write in the same dest folder
  def dest_folder_ctx path
    old, $dest_folder_ctx = $dest_folder_ctx, path
    yield
  ensure
    $dest_folder_ctx = old
  end
end

version = File.open("VERSION").read
acunote_shortcuts = File.open(File.join(SRC_PATH,"acunote-shortcuts.js")).read
sites = Dir[File.join(SRC_PATH, "sites","*.js")].map do |file|
  {
    :name => File.basename(file, ".js"),
    :code => File.open(file){|f| f.read }
  }
end

def render template
  ERB.new(File.new(File.join(TEMPLATES_PATH,"#{template}.erb")).read).result()
end

def indent( text, add = "    " )
  add + text.gsub(/\n/, "\n" + add)
end

order = [
  "reddit",
  "hn",
  "digg",
  "dummy",
  "redmine"
]
sites.sort! do |a,b|
  order.index(a[:name]) <=> order.index(b[:name])
end

# Mapping of source files
# Greasemonkey
dest = File.join( GM_PATH, "acunote-shortcuts.user.js")
File.open( dest, "w" ) do |out|
  out.write(render("acunote-shortcuts.user.js"))
end
