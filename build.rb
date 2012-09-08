#!/usr/bin/env ruby
# Script to create greasemonkey and firefox addon based on sources in lib folder

require "erb"

SRC_PATH="lib/"
GM_PATH="greasemonkey/"
RAILS_PATH="rails/plugin/"
EXTENSION_PATH="extension/"
TEMPLATES_PATH="lib/templates/"

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
  "ycombinator",
  "digg",
  "dummy",
  "redmine"
]
sites.sort! do |a,b|
  (order.index(a[:name])||order.size) <=> (order.index(b[:name])||order.size)
end

# Generate greasemonkey

dest = File.join( GM_PATH, "acunote-shortcuts.user.js")
File.open( dest, "w" ) do |out|
  out.write(render("acunote-shortcuts.user.js"))
end

# Generate firefox extension

dest = File.join( EXTENSION_PATH, "src", "content", "overlay.js")
File.open( dest, "w" ) do |out|
  out.write(render("overlay.js"))
end

dest = File.join( EXTENSION_PATH, "src", "install.rdf")
File.open( dest, "w" ) do |out|
  out.write(render("install.rdf"))
end

puts "Building firefox extension xpi..."
system("cd #{EXTENSION_PATH}/src; zip -r ../acunote-shortcuts.xpi *")
puts "Extension successfully created"