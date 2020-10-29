if (!Object.prototype.on) {
    Object.defineProperty(Object.prototype, 'on', {
        value: function(event, callback, bubble) {
            if (this == null) {
                throw new TypeError('Not an object');
            }

			this.addEventListener(event, callback, bubble || false)
        }
    });
}

if (!Object.prototype.forEach) {
	Object.defineProperty(Object.prototype, 'forEach', {
		value: function(callback, thisArg) {
			if (this == null) {
				throw new TypeError('Not an object');
			}
			thisArg = thisArg || window;
			for (var key in this) {
				if (this.hasOwnProperty(key)) {
					callback.call(thisArg, this[key], key, this);
				}
			}
		}
	});
}
