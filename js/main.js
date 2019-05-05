console.log("%cNICHT HÄCKEN SONST ANZEIGE OK?", "font: 2em sans-serif; color: yellow; background-color: red;");

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
	return entityMap[s];
  });
}

var $osd = $('#osd');
var $viewers = $('.item.eye');
var streamerID = "Drache_Offiziell";
var $posInfo = $('.posInfo');
var $p1 = $posInfo.children(':eq(0)');
var $p2 = $posInfo.children(':eq(1)');
var $p3 = $posInfo.children(':eq(2)');

var streamerOnline = false;
var playerOnline = false;
var firstDone = false;
var intervalID = -1;
var currentPlayer = null;
var socket;

function getParam(parameterName) {
	var result = null,
		tmp = [];
	location.search
		.substr(1)
		.split("&")
		.forEach(function (item) {
		  tmp = item.split("=");
		  if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
		});
	return result;
}

var stats = {
	viewers: 0,
	bans: 0,
	mutes: 0,
	mods: -1,
	barsTotal: 0,
	barsBots: 0,
	mutedUsers: [],
	monitored: false,
	lowlevel: 0,
	subonly: false
};

var settings = {
	showChat: true,
	showGuests: false,
	showFeed: false,
	feedPos: 'L',
	showBlocklist: false,
	showBarCounter: true,
	showOSD: false,
	feedNoPics: false,
	hideAvatars: false,
	hideGifts: false,
	hideSuper: false,
	hideTimestamps: true,
	hideBlocks: false,
	soundGift: null,
	soundBars: null,
	soundBlock: null
}

function settingsToCookie() {
	var obj = {
		showChat: settings.showChat,
		showFeed: settings.showFeed,
		showGuests: settings.showGuests,
		feedPos: settings.feedPos,
		showBlocklist: settings.showBlocklist,
		showBarCounter: settings.showBarCounter,
		showOSD: settings.showOSD,
		hideAvatars: settings.hideAvatars,
		hideGifts: settings.hideGifts,
		hideSuper: settings.hideSuper,
		hideTimestamps: settings.hideTimestamps,
		hideBlocks: settings.hideSuper,
		feedNoPics: settings.feedNoPics,
		soundGift: settings.soundGift != null ? settings.soundGift.filename : null,
		soundBars: settings.soundBars != null ? settings.soundBars.filename : null,
		soundBlock: settings.soundBlock != null ? settings.soundBlock.filename : null
		
	};

	$.cookie('layout', JSON.stringify(obj), {expires: 365, expiresAt: 365});
}

function blockListWidthControl() {
	
}

function adjustLayout() {
	var mwidth = 0;

	if(settings.showChat) {
		$('#bar_monitor').css('display', 'none');
		$('#messages').css('display', 'block').css('height', '100%');
		$('#chat').css('display', 'block');  
		mwidth = 350;
	} else {
		$('#messages').css('display', 'none');
		$('#chat').css('display', 'none');
	}

	$('#stream').css('width', 'calc(100% - ' + mwidth + 'px)');


	if(settings.hideAvatars)
		$('#chat').addClass('noavatars');
	else
		$('#chat').removeClass('noavatars');
	
	if(settings.hideTimestamps)
		$('#chat').addClass('notimestamps');
	else
		$('#chat').removeClass('notimestamps');

	if(settings.hideGifts)
		$('#chat').addClass('nogifts');
	else
		$('#chat').removeClass('nogifts');

	if(settings.hideSuper)
		$('#chat').addClass('nosuper');
	else
		$('#chat').removeClass('nosuper');

	$('#messages').scrollTop($('#messages')[0].scrollHeight);
}

function updatePosDiagram(pos, list) {
	if(pos == 0) {
		$posInfo.css('visibility', 'hidden');
		return;
	} else {
		$posInfo.css('visibility', 'visible');
	}

	$posInfo.find('.label').remove();

	if(list.length == 2) {
		$p3.css('display', 'none');
	} else {
		$p3.css('display', 'inline-block');
	}

	if(pos == 1) {
		$p2.html('2').removeClass('current').append('<div class="label top">' + list[1] + '</div>');;
		$p3.html('3').removeClass('current').append('<div class="label bottom">' + list[2] + '</div>');;
		$p1.removeClass('firstAwy').addClass('current');
	} else {
		$p1.removeClass('current').removeClass('firstAwy').append('<div class="label top">' + list[0] + '</div>');

		if(pos >= 3) {
			$p2.removeClass('current').html(pos - 1).append('<div class="label bottom">' + list[pos - 2] + '</div>');
			$p3.html(pos);
		} else {
			$p2.html('2');
			$p3.html('3');
		}

		if(pos > 3) {
			$p1.addClass('firstAwy');
			$p3.addClass('current');
		} else if(pos == 2) {
			$p2.addClass('current');
			$p3.removeClass('current').append('<div class="label bottom">' + list[pos] + '</div>');
		} else {
			$p3.addClass('current');
		}
	}

}

function refreshViewers() {
	if(stats.monitored && stats.viewers >= currentPlayer.streamerData.viewers && currentPlayer.streamerData.viewers > 50) {
		$viewers.css('color', '#08db66');
	} else {
		$viewers.css('color', '#aaa');
	}
}

function getUser(uid, success, error) {
	$.ajax({
            url: 'https://api.younow.com/php/api/channel/getInfo/channelId=' + uid + '/includeUserKeyWords=1',
            jsonp: "callback",
            dataType: "jsonp",
            success: function (json, b, c) {  
            	success(json);
            },
            'error': error
        });
}

$(document).ready(function () {
	$('[title]:not([data-tooltippos])').tipsy({gravity: $.fn.tipsy.autoNS, opacity: 1, trigger: 'hover'});
	$('[title][data-tooltippos]').each(function() {
		console.log($(this).attr('data-tooltippos'));
		$(this).tipsy({gravity: $(this).attr('data-tooltippos'), opacity: 1});
	});
	

	$('body').on('click', '.featherlight-content textarea, .popup textarea', function() {
		$(this)[0].select();
	});

	$('body').on('click', '.userinfo, #chat ul li .img', function() {
		 getUser($(this).attr('data-uid'), function (json, b, c) {    
            	if(json.errorCode != 0) {
            		alert('Der User existiert nicht mehr. Vermutlich wurde er kürzlich gebannt.');
            		return;
            	}   

                $('#featherlight-userinfo').find('h2 a').attr('href', 'https://yntrend.pw/user/' + json.userId).html(json.firstName + ' (' + json.level + ')');
                $('#featherlight-userinfo').find('[data-field=partner]').html(json.isPartner ? 'Ja' : 'Nein');
                $('#featherlight-userinfo').find('[data-field=subscribable]').html(json.isSubscribable == 1 ? 'Ja' : 'Nein');
                $('#featherlight-userinfo').find('[data-field=registered]').html(moment(json.dateCreated).format('DD.MM.YY, HH:mm'));
                $('#featherlight-userinfo').find('[data-field=country]').html(json.country.toUpperCase() + ' (Sprache ' + json.language.toUpperCase() + ')');
                $('#featherlight-userinfo').find('[data-field=flag]').attr('src', 'https://ipdata.co/flags/' + json.country.toLowerCase() + '.png');
                $('#featherlight-userinfo').find('[data-field=streams]').html((1*json.broadcastsCount).toFormat(0, ',', '.'));
                $('#featherlight-userinfo').find('[data-field=fans]').html((1*json.totalFans).toFormat(0, ',', '.'));
                $('#featherlight-userinfo').find('[data-field=gsr]').html(json.globalSpenderRank);
                $('#featherlight-userinfo').find('.profile_pic').attr('src', 'https://cdn2.younow.com/php/api/channel/getImage/?channelId=' + json.userId);
                
                $('#featherlight-userinfo').find('ul').html('<li style="margin:20px 0"><a style="font-weight:bold; font-size:19px" target="_blank" href="https://yntrend.pw/user/' + json.userId + '"><i class="fa fa-external-link"></i> YNTrend</a></li>')
                $('#featherlight-userinfo').find('ul').append('<li><a target="_blank" href="https://www.younow.com/' + json.profile + '"><i class="fa fa-external-link"></i> YouNow-Profil</a></li>');
                
                for(var i in json.snKeyWords) {
                	$('#featherlight-userinfo').find('ul').append('<li><a target="_blank" href="' + (json.snKeyWords[i].url.indexOf('https:') == -1 && json.snKeyWords[i].url.indexOf('http:') == -1 ? 'https://' : '') + json.snKeyWords[i].url + '"><i class="fa fa-external-link"></i> ' + i.charAt(0).toUpperCase() + i.slice(1) + '</a></li>')
                }
				
				$('#featherlight-userinfo').find('ul').append('<li><a target="_blank" href="http://api.younow.com/php/api/channel/getInfo/channelId=' + json.userId + '/includeUserKeyWords=1"><i class="fa fa-external-link"></i> YN-API</a></li>')
                
                $.featherlight($('#featherlight-userinfo').html(), {variant: 'featherlight-userinfo'});
            },
            function() {
            	alert('Fehler beim Abrufen der User-Infos.');
            }
        );
	});
	
	setInterval(function() {
	$('#datetime').html(moment().format('DD.MM.YY, HH:mm'));
	}, 1000);
	currentPlayer = new YouNowPlayer();

	$('#settingsBtn, #linkButton, #bellButton').click(function() {
		if(!$(this).siblings('.popup').is(':visible'))
			$(this).siblings('.popup').show(200);
	});

	$('#feedButton').click(function() {
		if(settings.showFeed) {
			settings.showFeed = false;
			$('#showFeed').removeAttr('checked');
		} else {
			settings.showFeed = true;
			$('#showFeed').prop('checked', true);
		}

		settingsToCookie();

		adjustLayout();
	})

	$('#showChat').attr('checked', 'checked');

	if(typeof $.cookie('layout') !== 'undefined') {
		try {
			var layout = JSON.parse($.cookie('layout'));

			for(var k in settings) {
				if(layout.hasOwnProperty(k) && layout[k] != null) {
					if($('#' + k).is(':checkbox')) {   
						if(layout.hasOwnProperty(k))                    
							settings[k] = layout[k] ? true : false;

						$('#' + k).prop('checked', settings[k]);
					} else if($('input[name=' + k + ']').is('[type=radio]')) {
						settings[k] = layout[k];
						$('input[name=' + k + '][value=' + settings[k] + ']').prop('checked', true);
					}
				} else if($('#' + k).is(':checkbox')) {
					$('#' + k).prop('checked', settings[k]);
				}
			}
		} catch(e) {}

		
	}

	adjustLayout();

	$(document).mouseup(function (e)
	{
		if(!$('.popup').is(e.target) && $('.popup').has(e.target).length === 0) {
			$('.popup').hide(200);
		}

		if(!$('#menu').is(e.target) && !$('#menuButton').is(e.target) && $('#menu').has(e.target).length === 0) {
			$('#menu').css('display', 'none');
			$('#menuButton').removeClass('active');
			$('#menuButton > i').removeClass('fa-caret-up').addClass('fa-caret-down');
		}
	});

	$('body').on('click', 'a.streamlink', function() {
		$('#streamerID').val($(this).attr('data-username'));
		currentPlayer.connect($(this).attr('data-username'), 1);
	});

	$('#menuButton').click(function(e) {
		if(!$(this).is('.active')) {
			$(this).addClass('active');
			$('#menu').css('display', 'block');
			$('#menuButton > i').removeClass('fa-caret-down').addClass('fa-caret-up');

		} else {           
			$(this).removeClass('active');
			$('#menu').css('display', 'none');
			$('#menuButton > i').removeClass('fa-caret-up').addClass('fa-caret-down');
		}
	});

	$('.popup, .osd').on('change', ':checkbox', null, function() {
		settings[$(this).attr('id')] = $(this).is(':checked');

		if($(this).attr('id') == 'showGuests') {
			currentPlayer.prepareGuestLoad($(this).is(':checked'));
		}

		adjustLayout();
		settingsToCookie();
	});

	$('.popup').on('change', ':radio', null, function() {
		settings[$(this).attr('name')] = $(this).val();
		adjustLayout();
		settingsToCookie();
	});

	queue = new NotificationQueue('#osd .gift');
	
	$('#connect').click(function () {
		currentPlayer.connect($('#streamerID').val(), 0);
	});

	if(getParam('s') != null) {
		streamerID = getParam('s');
		$('#streamerID').val(getParam('s'));   

		currentPlayer.connect(getParam('s'), 0);
	} else {
		$('#streamerID').val('Drache_Offiziell');   
	}

	setTimeout(function() {
		$('#feed').scrollTop(1).scrollTop(0);
	}, 500);

	var $stream = $('#stream');
	var onResize = function() {
	   var w = $stream.outerWidth(),
	   h = $stream.outerHeight() - 50;

	   
		$('#messages').scrollTop($('#messages')[0].scrollHeight);
	};

	$(window).on('resize', onResize());
	onResize();
});

$('#reconnectCheckbox').on('change', function() {
	if ($('#reconnectCheckbox').prop('checked')) {
		checkIfOnline();
	} else {
		clearInterval(intervalID);
	}
});

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (var i = 0; i < this.length; i++) {
		var character = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+character;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

Number.prototype.toFormat = function(decimals, decimal_sep, thousands_sep)
{ 
   var n = this,
   c = isNaN(decimals) ? 2 : Math.abs(decimals),
   d = decimal_sep || '.',   
   t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, 
   sign = (n < 0) ? '-' : '',

   i = parseInt(n = Math.abs(n).toFixed(c)) + '', 

   j = ((j = i.length) > 3) ? j % 3 : 0; 
   return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ''); 
}

function getTrends() {
	$.ajax({
		url: 'https://cdn.younow.com/php/api/younow/dashboard/locale=de/trending=50',
		jsonp: "callback",
		dataType: "jsonp",
		success: function (json, b, c) {
			if(json.errorCode == 0) {
				var str = '';

				for(var i = 0; i < json.trending_users.length; i++) {
					if(i > 0) {
						str += ', ';
					}

					str += '<a class="streamlink" data-username="' + json.trending_users[i].profile + '">' + json.trending_users[i].username + '</a>';
				}

				$('#trending').html(str);
			}

			setTimeout(getTrends, 30000);
		}
	});
}

getTrends();

function getStreamerStatus() {
	var self = this;
	streamerID = $('#streamerID').val();
	$.ajax({
		url: 'https://api.younow.com/php/api/broadcast/info/curId=0/user=' + streamerID,
		jsonp: "callback",
		dataType: "jsonp",
		success: function (json, b, c) {
			if (json["errorCode"] > 0 || json.userId == null || !json.hasOwnProperty('state') || !json.hasOwnProperty('user') || json.user == null) {
				streamerOnline = false;
				stats.subonly = false;
				stats.lowlevel = 0;
				stats.subcount = 0;
			} else {
				streamerOnline = true;
				stats.subonly = json.chatMode != 0;
				stats.lowlevel = json.minChatLevel;
				stats.mods = !!json.broadcastMods ? JSON.parse(json.broadcastMods).length : 0;
				stats.viewersLoggedin = json.lviewers;
				stats.viewersTotal = json.viewsWithThreshold;
				stats.subcount = json.subscribersCount;
				stats.mutedUsers = !!json.silentFromChatUsers ? JSON.parse(json.silentFromChatUsers) : [];
				stats.mutes = stats.mutedUsers.length;
			}
		}
	});
}

var chances = 3;

function checkIfOnline() {
	intervalID = setInterval(function () {
		if (streamerOnline && !playerOnline && $('#reconnectCheckbox').prop('checked')) {
			currentPlayer.connect($('#streamerID').val(), 1);
			chances = 3;
		} else if (playerOnline && !streamerOnline && --chances == 0) {
			currentPlayer.disconnect();
		} else {
			chances = 3;
		}
		getStreamerStatus()
	}, 5000);
}


checkIfOnline();
