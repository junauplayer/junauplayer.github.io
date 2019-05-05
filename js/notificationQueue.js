var NotificationQueue = function (e) {
    this.element = $(e);
    this.queue = [];
    this.active = false;
    this.closeTimeout = null;
    this.closedManually = false;
    this.sounds = {};
    var self = this;

    this.gift_strings = { DAILY_SPIN_JACKPOT: 'Daily Spin-Jackpot',
        LAMBORGHINI: 'Lamborghini',
        SUBSCRIPTION: 'Abonnement',
        '2000_LIKES': '2000 Likes',
        TIP: 'Tip',
        EARTH_DAY: 'Earth Day',
        DAILY_SPIN: 'Daily Spin',
        '400_LIKES': '400 Likes',
        HALLOWEEN_TREASURE: 'Halloweenschatz',
        TURKEY: 'Truthahn',
        ARWORD: 'Arword',
        CONFETTI: 'Konfetti',
        '50_LIKES': '50 Likes',
        FANMAIL: 'Fanmail',
        REDROSE: 'Rote Rose',
        COFFEE: 'Kaffee',
        APPLAUSE: 'Applaus',
	FREESPIN_BARS: 'Bars (Freespin)',
        EASTER_HATCH: 'Osterei',
        PROPOSAL_RING: 'Heiratsantrag',
        CHATCOOLDOWN: 'Chat-Cooldown'
    };

    var skus = Object.keys(this.gift_strings);

    this.element.mouseenter(function(e) {
        self.mouseenterHandler(self, e);
    });

    this.element.mouseleave(function(e) {
        self.mouseleaveHandler(self, e);
    });

    this.element.click(function(e) {
        self.clickHandler(self, e);
    });
};

NotificationQueue.prototype.getGiftNameBySKU = function(sku) {
    if(this.gift_strings.hasOwnProperty(sku))
        return this.gift_strings[sku];

    return sku;
}

NotificationQueue.prototype.enqueue = function (message) {
    this.queue.push(message);

    if(!this.active) {
        this.displayNext();        
    }
};

NotificationQueue.prototype.displayNext = function () {
    this.active = true;
    this.closedManually = false;
    var message = this.queue.shift();

    this.element.find('h2').removeClass();
    this.element.removeClass();

    if(message.hasOwnProperty('sound')) {
        message.sound.play();
    }

    var self = this;
    
    this.element.addClass(message.type);
    this.element.find('h2').addClass(message.type).html(message.headline);
    this.element.find('.level').html(message.level > 0 ? message.level : '?');
    this.element.find('.username').html(message.username).attr('href', 'https://younow.com/' + message.userID);

    this.element.slideDown(200);

    if(message.hasOwnProperty('message') && message.message.length > 0)
        this.element.find('.message').css('display', 'block').html(message.message);
    else
        this.element.find('.message').css('display', 'none');

    this.addTimeout();
    
};

NotificationQueue.prototype.addTimeout = function() {
    var self = this;

    this.closeTimeout = setTimeout(function() {
        self.element.slideUp(200, function() {
            self.active = false;

            if(self.queue.length > 0) {
                self.displayNext();
            }
        });       
    }, 4000);
}

NotificationQueue.prototype.mouseenterHandler = function(self) {
    clearTimeout(self.closeTimeout);
    self.closeTimeout = null;
}

NotificationQueue.prototype.mouseleaveHandler = function(self) {
    if(!self.closedManually && self.closeTimeout == null)
        self.addTimeout();
}

NotificationQueue.prototype.clickHandler = function(self, e) {
    if($(e.target).is('a')) return;
    
    clearTimeout(self.closeTimeout);
    self.closedManually = true;
    self.element.css('display', 'none');
    self.active = false;

    if(self.queue.length > 0) {
        self.displayNext();
    }
}
