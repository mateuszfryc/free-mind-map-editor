class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    
        return this;
    }

    setV(vector) {
        this.x = vector.x;
        this.y = vector.y;
    
        return this;
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
    }

    multiply(number) {
        this.x *= number;
        this.y *= number;
    
        return this;
    }

    multiplyV(vector) {
        this.x *= vector.x;
        this.y *= vector.y;
    
        return this;
    }

    getCopy() {
        return new Vector(this.x, this.y);
    }

    addV(other) {
        this.x += other.x;
        this.y += other.y;
    
        return this;
    }

    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
    
        return this;
    }
}
