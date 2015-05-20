var sr = null;
var targetLang = 'es';
var sourceLang = navigator.language.substr(0,2);
var confidence = 0.4;

function setSourceLang(el) {
	sourceLang = el.href.substr(el.href.length-2, 2);
	
	if(sr) {
		sr.abort();
		sr.lang = sourceLang;
	}
	$('#speakBtn').html(el.text);
	
	return false;
}


function setTargetLang(el) {
	targetLang = el.href.substr(el.href.length-2, 2);
	$('#transBtn').html(el.text);
	return false;
}

var gApiKey = 'AIzaSyBFbIbIAybTBKW_HWtLWtS6IDSPf-gK5Uk';

$(function() {

	$('#confidenceRange').slider({
		min: 0.01,
		max: 0.99,
		step: 0.01,
		value: confidence,
		slide: function(el, v) { 
			confidence = v.value;
			$('#confidenceLabel').html('Confidence ' + Math.floor(v.value * 100) + '%');
		}
	});

	$('.toool').tooltip({
		placement: 'bottom',
		delay: { show: 200, hide: 300 }
	});

	$('#firstTimeChk').on('change', function() {
		if(this.checked) {
			localStorage["beenherebefore"] = 'yes';
		} else {
			localStorage.removeItem("beenherebefore");
		}
	});

	$.getJSON('https://www.googleapis.com/language/translate/v2/languages?key=' + gApiKey + '&target=en&callback=?', function(data) {
		var bl = sourceLang;
		for(var i in data.data.languages) {
			var l = data.data.languages[i];
		    if(l.language == bl) {
		        bl = l.name;
		    }
		    $('#transDropMenu').append($('<li><a href="#' + l.language + '" onclick="return setTargetLang(this);">' + l.name + '</a></li>'));
		    $('#speakDropMenu').append($('<li><a href="#' + l.language + '" onclick="return setSourceLang(this);">' + l.name + '</a></li>'));
		}
		$('#speakBtn').html(bl);
	})

	var iframeSpeak = function(transText) {
		var ifrm = document.createElement("IFRAME"); 
	    ifrm.setAttribute("src", "http://translate.google.com/translate_tts?tl=" + targetLang + "&q=" + transText.replace(/ /g, '+')); 
	    ifrm.style.width = 0+"px"; 
	    ifrm.style.height = 0 +"px"; 
	    document.body.appendChild(ifrm); 
	};

	var translateAndSpeak = function(speakStr, con) {
		$('#speakP').html($('<span>').html(speakStr));

		if(targetLang == sourceLang) {
			$('#transP').html($('<span>').html(speakStr));
			iframeSpeak(speakStr);
			return;
		}

      	$.getJSON('https://www.googleapis.com/language/translate/v2?key=' + gApiKey + '&source=' + 
      			sourceLang + '&target=' + targetLang + '&q=' + encodeURIComponent(speakStr) + '&callback=?', function(data) {

			if(data.error) {
				var span = $('<span>').html(data.error.message);
			  	span.css('color', 'red');
			  	$('#speakP').html(span);
			  	return;
			}

			var transText = $("<div/>").html(data.data.translations[0].translatedText).text();
			$('#transP').html($('<span>').html(transText));

			iframeSpeak(transText);

		}).error(function() {
			var span = $('<span>').html('Could not translate ' + speakStr);
		  	span.css('color', 'red');
		  	$('#speakP').html(span);
		});
	};
	
	$('.navbar').css('height', '40px');
	
	setTimeout(function() {
		
		$('.navbar > .navbar-inner > .container').fadeIn('slow');
	
		if(typeof (SpeechRecognition) === 'function') {
			sr = new SpeechRecognition();
		} else if(typeof (webkitSpeechRecognition) === 'function') {
			sr = new webkitSpeechRecognition();
		} else if(typeof (mozSpeechRecognition) === 'function') {
			sr = new mozSpeechRecognition();
		}
	
		if(sr != null) {	
			sr.continuous = true;
		    sr.onresult = function(event) {
		    	var sra = event.results[0][0];
			    var con = sra.confidence;
			    
			    if(con == 0.0) {
			    	return;
			    }
			    
			    $('#transP').html('');
	
			    if(con > confidence) {
			      	var tr = sra.transcript;
			      	translateAndSpeak(tr, con);
			      	$('#whatyousaid').html('What you said with ' + Math.floor(con*100) + '% confidence')
	
			    } else {
			    	$('#whatyousaid').html('What you said');
			   		var span = $('<span>').html('I\'m not sure I heard you right. Confidence was ' + Math.floor(con*100) + '%');
				  	span.css('color', 'red');
				  	$('#speakP').html(span);
				}
	
			};
		    
		    sr.onend = function(event) { 
		    	sr.start();
		    };
	 	    
			sr.start();
		} else {
			$('#noSpeechBox').modal();
			return;
		}
		
		if(!localStorage["beenherebefore"]) {
			localStorage["beenherebefore"] = 'yes';
			$('#firstTimeBox').modal();
		}
	}, 1500);
	
}); 