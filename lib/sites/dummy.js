// Please add your scripts here. Copy and paste the dummy script definition
// and modify it to your needs.
// Don't forget to modify the big supported sites map at the end of this file
// to turn your script on.

/*
 *  ===========================================================
 *  Shortcuts Library: Dummy Script
 *  Copyright (c) Year Author
 *  ===========================================================
 */
function DummySource() {
    var Cursor = {

        init: function() {
            shortcutListener.init();
        },

        help: function() {
            alert('Dummy shortcuts script works!');
        }

    }

    var SHORTCUTS = {
        '?': function() { Cursor.help(); },
    }
}

SupportedSites['example.com/'] = DummySource;