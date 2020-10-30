class BoundingBox {
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
            const amount = new Vector(
                -x + a + width,
                -y + b + height,
            )
    
            return {
                me: me.parent,
                other: other.parent,
                amount, 
            };
        }
    
        return false;
    }
}
