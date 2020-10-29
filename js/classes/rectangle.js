class Rectangle {
    constructor(x, y, width, height, parent) {
        this.position = new Vector(x, y);
        this.width = width;
        this.height = height;
        this.parent = parent;
    }

    isOverlappingWith(other) {
        const me = this;
        const { width, height } = me;
        const { x, y } = this.position.getCopy();
        const { x: a, y: b } = other.position.getCopy();
        const isColliding = x + width >= a &&
                            y + height >= b &&
                            y <= b + other.height &&
                            x <= a + other.width;

        if (isColliding) {
            const mixedWidth = width + other.width;
            const mixedHeight = height + other.height;
            const overlap = new Vector(
                mixedWidth - ((a - x) * 2),
                mixedHeight - ((b - y) * 2),
            )
    
            return {
                me,
                other,
                overlap, 
            };
        }
    
        return false;
    }
}
