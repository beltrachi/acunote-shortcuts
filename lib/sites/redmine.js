/*
 *  ===========================================================
 *  Shortcuts Library: Redmine Script
 *  Copyright (c) 2012 Jordi Beltran
 *  ===========================================================
 */
function RedmineSource() {
    
    var CursorHelp =
        '=== Cursor Movement ===\n' +
        'j - move cursor up\n' +
        'k - move cursor down\n' +
        'o - open issue\n' +
        '\n=== Browsing ===\n' +
        'g p - open "projects" page\n' +
        'g i - open "issues" page\n' +
        'g c - open "new issue" page\n' +
        'g a - open "activity" page\n' +
        'g s - open "summary" page\n' +
        'g n - open "news" page\n' +
        'g f - open "forum" page\n' +
        'g l - open "files" page\n' +
        'g r - open "repository" page\n' +
        'g o - open "roadmap" page\n' +
        '\n=== Other ===\n' +
        's - goto search box\n' +
        '? - this help\n';
    
    // Defines how to find the lists of items and search results
    // The link function recieve the current item selected by the "item" selector
    var selectors = {
        issues:{
            list: "table.list.issues",
            item: ".issue",
            link: function(current){
                //Notice: We expect that the tr has an id="issue-1234"
                return "/issues/"+current.id.split("-")[1];
            },
            next_page_link: function(){
                // Bad luck, Redmine guys did not set a rel=prev and next on them
                var cand = $$("#content .pagination a").last();
                //Filter in case last link was another piece
                if( cand.href.indexOf(location.pathname) != -1){
                    if( selectors.issues.compare_pages( cand.href, location.href) == 1){
                        return cand.href;
                    }
                }
            },
            previous_page_link: function(){
                var cand = $$("#content .pagination a").first();
                //Filter in case last link was another piece
                if( cand && cand.href.indexOf(location.pathname) != -1){
                    if( selectors.issues.compare_pages( cand.href, location.href ) == -1){
                        return cand.href;
                    }
                }
            },
            page_num: function(url){
                var m = url.match("(?:&|\\?)page=(\\d+)");
                return ( m ? (m[1] * 1) : null );
            },
            // 1 : a>b
            // 0 : a=b
            //-1 : a<b
            compare_pages: function(a, b){
                var anum = selectors.issues.page_num(a),
                  bnum = selectors.issues.page_num(b);
                return ( anum > bnum ? 1 : (anum === bnum ? 0 : -1 ));
            }
        },
        search:{
            list: "#search-results",
            item: "dt",
            link: function(current){
                return $(current).down("a").href;
            },
            next_page_link: function(){
                // Bad luck, Redmine guys did not set a rel=prev and next on them
                var cand = $$("#content a").last();
                //Filter in case last link was another piece
                if( cand.href.indexOf(location.pathname) != -1){
                    return cand.href;
                }
            },
            previous_page_link: function(){
                var cand = $$("#content a");
                cand = cand[cand.length-2];
                //Filter in case last link was another piece
                if( cand && cand.href.indexOf(location.pathname) != -1){
                    return cand.href;
                }
            }
        },
        highlighted: ".focused",
        highlighted_class: "focused"
    }
    var Cursor = {

        init: function() {
            shortcutListener.init();
            
            //Add styles
            var ctx, style_rules = [];
            for(var ctx_name in selectors){
                ctx = selectors[ctx_name];
                if( ctx.list ){
                    style_rules.push( ctx.list + " " + ctx.item + selectors.highlighted);
                }
            }
            $$("head").first().insert({bottom:
                "<style>"+ style_rules.join(", ") + " {border:2px solid #2A5685}</style>"
            });
        },

        help: function() {
            alert(CursorHelp);
        },
        //Warning: Using Prototype already loaded on redmine page
        jumpToLink: function(selector){
            Cursor.goToURL( $$(selector).first().href );
        },
        
        focusOn: function(selector){
            $$(selector).first().focus();
        },
        getCurr: function(ctx){
            return $$(selectors[ctx].list).first().select(selectors.highlighted).first();
        },
        //Bidirectional navigation give dir the direction and it calls the 
        //corresponding Prototype element method
        goDir: function(dir){
            var next, list, ctx = Cursor.getListCtx();
            var curr = Cursor.getCurr(ctx);
            if( curr ){
                next = curr[dir](selectors[ctx].item);
            }else{
                list = $$(selectors[ctx].list + " "+ selectors[ctx].item);
                if(dir == "next"){
                    next = list.first();
                }else{
                    next = list.last();
                }
            }
            if( next ){
                if( curr ){ 
                    curr.removeClassName(selectors.highlighted_class);
                }
                next.addClassName(selectors.highlighted_class);
                if( !Cursor.elementInViewport(next) ){
                    Element.scrollTo(next);
                }
            }else{
                //Try to go next page
                Cursor.goNextPage(dir, ctx);
            }
            return next;
        },
        goNextPage: function(dir,ctx){
            var link, next_page_func = selectors[ctx][dir+"_page_link"];
            if( next_page_func ){
                link = next_page_func();
                if( link ) Cursor.goToURL(link);
            }
        },
        goNext: function(){
            Cursor.goDir("next");
        },
        goPrev: function(){
            Cursor.goDir("previous");
        },
        getListCtx: function(){
            return ( $$(selectors.search.list).first() ? "search" : "issues");
        },
        goFocusedItem: function(){
            var curr, ctx = Cursor.getListCtx();
            curr = Cursor.getCurr(ctx);
            if(curr) Cursor.goToURL(selectors[ctx].link(curr));
        },
        // from http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
        elementInViewport:function (el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth 
                );
        },
        goToURL: function(url){
            location.href = url;
        }
    }
    
    var SHORTCUTS = {
        '?': function() {Cursor.help();},
        's': function() { Cursor.focusOn("#q"); },
        
        'j': function() { Cursor.goPrev(); },
        'k': function() { Cursor.goNext(); },
        'o': function() { Cursor.goFocusedItem(); },
        
        'g': {
            'p': function() {location.href = '/projects';},
            'i': function() { Cursor.jumpToLink(".issues"); },
            'c': function() { Cursor.jumpToLink(".new-issue"); },
            'a': function() { Cursor.jumpToLink(".activity"); },
            's': function() { Cursor.jumpToLink(".summary"); },
            'n': function() { Cursor.jumpToLink(".news"); },
            'f': function() { Cursor.jumpToLink(".forum"); },
            'l': function() { Cursor.jumpToLink(".files"); },
            'r': function() { Cursor.jumpToLink(".repository"); },
            'o': function() { Cursor.jumpToLink(".roadmap"); },
            'w': function() { Cursor.jumpToLink(".wiki"); },
            't': function() { Cursor.jumpToLink(".settings"); }
        }
    };
}

SupportedSites['redmine.org'] = RedmineSource;

// Allow any domain hosting a redmine instance to use it
// You need to allow this userscript on the domain. 
// In firefox you configure the script in the user config.
// Dirty hack search for the description metatag.
try{
    var item, list = document.getElementsByTagName("meta");
    for(var i = 0;i < list.length; i++){
        item = list[i];
        if( item.getAttribute("name") == "description" && 
                item.getAttribute("content") == "Redmine"){
            SupportedSites[location.hostname] = RedmineSource;
            break;
        }
    }
}catch(e){
    if(console) console.error(e);
}
