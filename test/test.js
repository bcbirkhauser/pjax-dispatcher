var testModule = {
    runMe: function() {
        console.debug('you ran me good');
    }
};



var testClass = Class.extend({
    init: function() {
        console.debug('you init the super cool test class');
    },
    superCool: function() {
        console.debug('you are super cool');
    }
});

var dispatcher = new Dispatcher({
    '/#awesomesauce': testModule.runeMe,
    '/#supercool': function() {
        var c = new testClass();
        c.superCool();
    }
});

$(function() {
    $('a[data-pjax]').unbind('click').bind('click', function(e) {
        $.pjax.click(e, {
            container: '#contentContainer',
            timeout: 7000
        });
    });
})