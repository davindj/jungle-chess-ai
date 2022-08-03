export class Animal {
    constructor(rank, color, point){
        this.rank = rank
        this.color = color
        this.point = {
            x: point[0],
            y: point[1]
        }
    }
    
    canEat(foe,trap){
        if(trap == this.color)
        return true;
        if(this.rank == 1 && foe.rank == 8)
        return true;
        if(this.rank == 8 && foe.rank == 1)
        return false;
        return this.rank >= foe.rank;
    }

    createDiv(){
        const newDiv = document.createElement('div')
        const tileSize = 50
        const stroke = 1;
        newDiv.style = `
            width: 100%; height: 100%;
            margin: auto auto;
            background-color: ${this.color ? 'red' : 'royalblue'};
            padding-left: 2px;
            color: white; 
            text-shadow: -${stroke}px 0 black, 0 ${stroke}px black, ${stroke}px 0 black, 0 -${stroke}px black;
            background-image: url("image/${this.rank}.png");
            background-size: 100% 100%;
        `
        newDiv.innerHTML = this.rank;
        newDiv.x = this.point.x; newDiv.y = this.point.y;
        return newDiv;
    }
}