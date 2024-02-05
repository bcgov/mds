utcDate = new Date()
date = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60 * 1000)
if (window.location.href.indexOf("localhost") > -1 && date.getMonth() === 3 && date.getDate() === 1) {
    var random = Math.floor(Math.random() * 20) + 1
    if (random === 1) {
        setTimeout(function () {
            var text = new SpeechSynthesisUtterance(atob('ZGlkIHlvdSByZW1lbWJlciB0byBhZGQgdW5pdCB0ZXN0cz8='));
            speechSynthesis.speak(text);
        }, 30000);
    }
    else if (random === 2) {
        document.body.style = 'cursor: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/np_cursor_740125_000000.png), default;'
    }
    else if (random === 3) {
        window.location.replace(atob('aHR0cDovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PWRRdzR3OVdnWGNR'));
    }
}