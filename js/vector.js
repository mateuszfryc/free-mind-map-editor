function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    return this;
}

Vector.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;

    return this;
}

Vector.prototype.copyFrom = function(vector) {
    this.x = vector.x;
    this.y = vector.y;

    return this;
}

Vector.prototype.add = function(other) {
    this.x += other.x;
    this.y += other.y;

    return this;
}

Vector.prototype.subtract = function(other) {
    this.x -= other.x;
    this.y -= other.y;

    return this;
}
