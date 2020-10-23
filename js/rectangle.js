function Rectangle(x, y, width, height, parent) {
    const me = this;
    
    me.position = new Vector(x, y);
    me.x = x;
    me.y = y;
    me.width = width;
    me.height = height;
    me.parent = parent;
}

Rectangle.prototype.getPosition = function() {
    return new Vector().copyFrom(this.position);
}

Rectangle.prototype.isOverlappingWith = function(other) {
    const me = this;
    const { width, height } = me;
    const { x, y } = me.getPosition();
    const isColliding = x + width >= other.x &&
                        y + height >= other.y &&
                        y <= other.y + other.height &&
                        x <= other.x + other.width;

    if (isColliding) {
        return {
            me,
            other,
            overlap: new Vector(
                x - other.x,
                y - other.y || height
        )};
    }

    return false;
}

Rectangle.prototype.draw = function() {
    Draw.rectangle(this);
}
