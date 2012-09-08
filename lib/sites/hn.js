/*
 *  ===========================================================
 *  Acunote Shortcuts: Hacker News Support
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
function HnSource() {
    var HnCursorImageData = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%09%00%00%00%0B%08%06%00%00%00%ADY%A7%1B%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0D%3A%00%00%0D%3A%01%03%22%1E%85%00%00%00%07tIME%07%D6%0B%10%090%06%16%8E%9BU%00%00%00%1DtEXtComment%00Created%20with%20The%20GIMP%EFd%25n%00%00%00PIDAT%18%D3%8D%D0%A1%0E%C0%20%0C%84%E1%BF%E7%B0(%DE%FF%E9PXd%A7XH%B7%95%9Dl%BE%E6%9A%1A%E0l%E9c%1A!%8A%C3V%8B%3F%D0%DBv%84%FA%AA%D9%A1%B2%7B%16%14%87%B4Z%FC%88%FA%98%A6%EC%E0U%AF%13%B8Q%06%00%EC%CF%C7%2F%C8T'%AFF%81S%0A%00%00%00%00IEND%AEB%60%82"

    var HnCursorStyles = 
        '#shortcut_status { background: #f00;color: #fff;padding: 5px;position: absolute;top: 10px;right: 10px;}\n'+
        '.cursor {position:absolute; margin-top: 4px;}';


    var HnCursorHelp =
                '=== Cursor Movement ===\n' +
                'j - move cursor up\n' +
                'k - move cursor down\n' +
                '\n=== Post Management ===\n' +
                'o, <Enter> - open original post\n'+
                'i - open comments\n' +
                'u - back to news list\n' +
                '\n=== Voting ===\n' +
                'v u - vote up\n' +
                '\n=== Browsing ===\n' +
                'g h - open "home" page\n' +
                'g n - open "newest" page\n' +
                'g j - open "jobs" page\n' +
                '\n=== Other ===\n' +
                '? - this help\n';


    var Cursor = {

        cursors: 0,
        current: 0,
        nextPageUrl: null,

        init: function() {
            this.addStyles(HnCursorStyles);
            var table = document.getElementsByTagName('table')[2];
            if (!table) return false;
            var cursorLeft = this.findPosX(table) - 15;
            var rows = table.tBodies[0].rows;
            if (rows.length == 0) return false;
            var j = 0;
            for(var i=0; i<rows.length;i++) {
                var row = rows[i];
                if (row.cells[0] && row.cells[0].className == 'title') {
                    j++;
                    // set id on post link
                    var link = row.cells[2].getElementsByTagName('a')[0];
                    link.setAttribute('id', 'post_link_'+j);
                    // set id on vote td
                    var voteCell = rows[i].cells[1];
                    if (voteCell) voteCell.setAttribute('id', 'vote_'+j);
                    // Create cursor
                    var cell = rows[i].cells[0];
                    var img = document.createElement('img');
                    img.className = "cursor";
                    img.src = HnCursorImageData;
                    img.style.display = 'none';
                    img.style.left = cursorLeft + 'px';
                    img.setAttribute('id', 'cursor_'+j);
                    cell.insertBefore(img, cell.firstChild);
                    // Process links
                    var rowLinks = rows[i+1].getElementsByTagName('a');
                    for(var linkIndex=0; linkIndex<rowLinks.length;linkIndex++) {
                        var rowLink = rowLinks[linkIndex];
                        var linkTarget = rowLink.getAttribute('href');
                        // Different users have different per-link actions
                        // availabe on HN, so it's too dangerous to go by
                        // position.  Instead we look at target href.
                        if (linkTarget.match('user')) {
                            // author
                            rowLink.setAttribute('id', 'author_link_'+j);
                        } else if (linkTarget.match('item')) {
                            // comments
                            rowLink.setAttribute('id', 'comment_link_'+j);
                        }
                    }
                }
                // Try to gen link to the next page
                if ((i == rows.length-1)) {
                    var a = rows[i].getElementsByTagName('a')[0];
                    if (a && a.innerHTML == "More") {
                        this.nextPageUrl = a.getAttribute('href');
                    }
                }
            }
            this.cursors = j;
            this.current = 1;
            this.showCursor(this.current);
            shortcutListener.init();
        },

        next: function() {
            var i = this.current + 1;
            if (i > this.cursors) {
                if (!this.nextPageUrl) return false;
                location.href = this.nextPageUrl;
            }
            this.showCursor(i);
        },

        previous: function() {
            var i = this.current - 1;
            if (i < 1) return false;    
            this.showCursor(i);
        },

        showCursor: function(i) {
            if (i<=0) return false;
            this.hideCursor(this.current);
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = '';
            this.current = i;

            var offset = window.pageYOffset;
            var innerHeight = window.innerHeight;
            var cursorPos = this.findPosY(c);
            if ( (cursorPos < (offset + 30)) || (cursorPos > (offset+innerHeight-30))) {
                window.scrollTo(0, cursorPos - (innerHeight/2))
            }

            document.getElementById('post_link_'+i).focus();

        },

        hideCursor: function(i) {
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = 'none';
        },

        jump: function(where) {
            var linkId = where + '_link_';
            var a = document.getElementById(linkId+this.current);
            if (a) location.href = a.getAttribute('href');
        },

        vote: function() {
            var cell = document.getElementById('vote_'+this.current);
            var links = cell.getElementsByTagName('a');
            for(var i=0; i<links.length;i++) {
                var a = links[i];
                if (a.getAttribute('id').match('up')) {
                    if (a.getAttribute('onclick')) {
                        vote(a);
                    } else {
                        location.href = a.getAttribute('href');
                    }
                }
            }
        },

        back: function() {
            if (location.href.match('item')) history.back();
        },

        help: function() {
            alert(HnCursorHelp);
        },

        findPosY: function (obj) {
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

        findPosX: function (obj) {
            if (!obj) return 0;
            var curleft = 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                while (obj = obj.offsetParent) {
                    curleft += obj.offsetLeft;
                }
            }
            return curleft;
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
        'j': function() { Cursor.next();},
        'k': function() { Cursor.previous();},
        'i': function() { Cursor.jump('comment');},
        'o': function() { Cursor.jump('post');},
        'v': {
            'u': function() { Cursor.vote();}
        },
        'u': function() { Cursor.back();},
        'g': {
            'h': function() { location.href = '/'; },
            'n': function() { location.href = '/newest'; },
            'j': function() { location.href = '/jobs'; }
        }
    }
}
