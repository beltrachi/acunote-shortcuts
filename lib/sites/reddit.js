/*
 *  ===========================================================
 *  Acunote Shortcuts: Reddit Support
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
function RedditSource() {
    var RCursorHelp =
        '=== Cursor Movement ===\n' +
        'j - move cursor up\n' +
        'k - move cursor down\n' +
        '\n=== Post Management ===\n' +
        'o, <Enter> - open original post\n'+
        'i - open comments\n' +
        'u - back to news list\n' +
        '\n=== Voting ===\n' +
        'v u - vote up\n' +
        'v d - vote down\n' +
        '\n=== Other ===\n' +
        '? - this help\n';

    var RCursorStyles = 
        '#shortcut_status { background: #f00;color: #fff;padding: 5px;position: absolute;bottom: 10px;right: 10px;}\n';


    var Cursor = {

        siteTable: null,
        siteTablePos: null,
        things: [],

        current: 0,

        init: function() {
            this.addStyles(RCursorStyles);
            this.siteTable = $('siteTable');

            if (this.siteTable) {
                this.siteTablePos = this.findPos(this.siteTable);
                this.things = document.querySelectorAll('#siteTable .thing');
                if (this.things) {
                    this.current = 0;
                    if (typeof readCookie !== 'undefined' && readCookie('jumpToLast')) {
                        this.showCursor(this.things.length - 1);
                        createCookie('jumpToLast', '0', -1);
                    } else
                        this.showCursor(this.current);
                }
            }
            shortcutListener.init();
        },

        next: function() {
            var i = this.current + 1;
            if (i >= this.things.length) {
                this.nextPage();
                return false;
            }
            this.showCursor(i);
        },

        previous: function() {
            var i = this.current - 1;
            if (i < 0) {
                this.previousPage(true);
                return false;
            }
            this.showCursor(i);
        },

        nextPage: function() {
            this.prevOrNextPage('next');
        },

        previousPage: function(setCursorToLastPosition) {
            setCursorToLastPosition = setCursorToLastPosition || false;
            this.prevOrNextPage('prev', setCursorToLastPosition);
        },

        prevOrNextPage: function(mode, setCursorToLastPosition) {
            var element = document.querySelector('p.nextprev a[rel]');
            if (element && element.innerHTML == mode) {
                if (setCursorToLastPosition) {
                    createCookie && createCookie('jumpToLast', '1', 0);
                }
                location.href = element.getAttribute('href');
            }
        },

        showCursor: function(i) {
            if (i < 0) return false;
            this.hideCursor(this.current);

            var row = this.things[i];
                numberNode = row.querySelector('.rank'),
                link = this.getLink(row);
                
            numberNode.style.color = 'black';
            numberNode.style.borderBottom = 'medium solid black'

            // move focus with cursor
            link && link.focus();

            var offset = window.pageYOffset,
                innerHeight = window.innerHeight,
                cursorPos = this.findPos(row);
                
            if ( (cursorPos < (offset + 58)) || (cursorPos > (offset+innerHeight-58))) {
                window.scrollTo(0, cursorPos - (innerHeight/2))
            }
            
            this.current = i;
        },
        getLink: function(row) {
            return row.querySelector('.title a.title');
        },
        getCommentLink: function(row) {
            return row.querySelector('.comments');
        },
        getCurrentRow : function() {
            return this.things[this.current];
        },

        hideCursor: function(i) {
            var row = this.things[i],
                numberNode = row.querySelector('.rank');

            numberNode.style.color = 'darkgray';
            numberNode.style.borderBottom = 'none';
        },

        voteUp: function() {
            this.getCurrentRow().querySelector('.midcol .arrow.up').onclick();
        },

        voteDown: function() {
            this.getCurrentRow().querySelector('.midcol .arrow.down').onclick();
        },

        openLink: function() {
            window.location.href = this.getLink(this.getCurrentRow()).getAttribute('href');
        },

        openComments: function() {
            window.location.href = this.getCommentLink(this.getCurrentRow()).getAttribute('href');
        },

        goBack: function() {
            if (
                window.location.href.match('comments') ||
                window.location.href.match('user') 
            ) {
                window.history.back();
            }
        },

        help: function() {
            alert(RCursorHelp);
        },

        findPos: function (obj) {
            if (!obj) return 0;
            var curtop = 0;
            if (obj.offsetParent) {
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    curtop += obj.offsetTop;
                }
            }
            return curtop;
        },

        findRowPos: function(row) {
            if (!row) return 0;
            return this.siteTablePos + row.offsetTop;
        },

        addStyles: function(css) {
            var head, style, text;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            text = document.createTextNode(css);
            style.appendChild(text);
            head.appendChild(style);
        }

    }


    var SHORTCUTS = {
        '?': function() { Cursor.help(); },
        'j': function() { Cursor.next(); },
        'k': function() { Cursor.previous(); },
        'o': function() { Cursor.openLink(); },
        'i': function() { Cursor.openComments(); },
        'u': function() { Cursor.goBack(); },
        'v': {
            'u': function() { Cursor.voteUp(); },
            'd': function() { Cursor.voteDown(); },
        }
    }
}
