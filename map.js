import { Animal } from "./animal.js";
export function init(){
    const map = document.querySelector('.map')
    const tileSize = 50;
    map.style = `
        width: ${tileSize*7}px; height: ${tileSize*9}px
    `;

    const mapObj = [];
    for (let i = 0; i < 7; i++) {
        mapObj.push([])
        for (let j = 0; j < 9; j++) {
            mapObj[i].push(null)
        }        
    }

    // map 7x9
    for(let i=0;i<9;i++){
        for (let j = 0; j < 7; j++) {
            const newDiv = document.createElement('div')
            newDiv.style = `
                width: ${tileSize}px; height: ${tileSize}px;
                left: ${tileSize*j}px; top: ${tileSize*i}px
            `
            newDiv.className = 'tile land';
            newDiv.id = `x${j}y${i}`;
            newDiv.x = j; newDiv.y = i;
            map.appendChild(newDiv);

            mapObj[j][i] = {
                animal: null,
                terrain: 'land',
                trap: -1,
                base: -1 // -1 bukan base, 0 base player1, 1 base player2
            }
        }
    }

    //water
    for(let i=3;i<=5;i++){
        for(let j=1;j<=5;j++){
            if(j == 3)
                continue;
            const tile = document.getElementById(`x${j}y${i}`);
            tile.classList.remove('land')
            tile.className += ' water';
            mapObj[j][i].terrain = 'water'
        }
    }

    //trap
    [[2,0],[3,1],[4,0],  [2,8],[3,7],[4,8]].forEach((val , idx)=>{
        mapObj[val[0]][val[1]].trap = idx < 3 ? 1 : 0;
        const tile = document.getElementById(`x${val[0]}y${val[1]}`);
        tile.classList.remove('land')
        tile.className += ' trap';
    });

    //base
    [[3,0],[3,8]].forEach((val,idx)=>{
        mapObj[val[0]][val[1]].base = !idx ? 1 : 0;
        const tile = document.getElementById(`x${val[0]}y${val[1]}`);
        tile.classList.remove('land')
        tile.className += ' base';
    });

    // animal
    [[6,6],[1,7],[5,7],[2,6],[4,6],[0,8],[6,8],[0,6]].forEach((val,idx)=>{
        mapObj[val[0]][val[1]].animal = new Animal(idx + 1, 0 , val)
    });
    
    [[0,2],[5,1],[1,1],[4,2],[2,2],[6,0],[0,0],[6,2]].forEach((val,idx)=>{
        mapObj[val[0]][val[1]].animal = new Animal(idx + 1, 1 , val)
    });

    // mapObj[5][2].animal = new Animal(8,1,[5,2])
    // mapObj[5][1].animal = new Animal(3,1,[5,1])
    // mapObj[4][2].animal = new Animal(2,1,[4,2])
    // mapObj[6][4].animal = new Animal(1,0,[6,4])

    return mapObj;
}

export function draw(map){
    for(let i=0;i<9;i++){
        for (let j = 0; j < 7; j++) {
            const animal = map[j][i].animal;
            const tile = document.getElementById(`x${j}y${i}`);
            tile.innerHTML = '';
            tile.classList.remove('active');
            if(!animal)
                continue;
            tile.appendChild(animal.createDiv());
        }
    }
}

export function generate(animal,map){
    // console.clear();
    // atas kanan bawah kiri

    if(animal == null)
        return;

    const x1 = animal.point.x;
    const y1 = animal.point.y;

    // UI
    document.querySelectorAll('.tile').forEach( div => div.classList.remove('active'))
    document.querySelector(`#x${x1}y${y1}`).classList.add('active')

    const move = [];
    move.push([0,-1]) // atas
    move.push([1,0]) // kanan
    move.push([0,1]) // bawah
    move.push([-1,0]) // kiri
    move.forEach((val)=>{
        let x2 = x1 + val[0];
        let y2 = y1 + val[1];
        let possible = false;
        if(x2 >= 0 && x2 <= 6 && y2 >= 0 && y2 <= 8){
            const foe = map[x2][y2].animal;
            if(!foe){
                if(map[x2][y2].base != -1){
                    if(map[x2][y2].base != animal.color){
                        possible = true;
                    }
                }else if(map[x2][y2].terrain == 'land' || animal.rank == 1){
                    possible = true;
                }else if(animal.rank == 6 || animal.rank == 7){
                    let valid = true;
                    let temp = null;
                    while(map[x2][y2].terrain != 'land'){
                        temp = map[x2][y2].animal;
                        if(!temp){
                            x2 += val[0]; y2 += val[1];
                        }else{
                            valid = false;
                            break;
                        }
                    }
                    temp = map[x2][y2].animal;
                    if(valid && (!temp || (animal.canEat(temp,map[x2][y2].trap) && temp.color != animal.color))){
                        possible = true;
                    }
                }
            }else if(foe.color != animal.color){
                if(animal.canEat(foe,map[x2][y2].trap) && (map[x1][y1].terrain == map[x2][y2].terrain)){
                    possible = true;
                }
            }
        }

        if(possible){
            document.querySelector(`#x${x2}y${y2}`).classList.add('active')
        }

    })

    // document.querySelectorAll('.tile').forEach((div)=>{
    //     div.classList.remove('hint');
    //     if(Math.abs(div.x - tile.x)+Math.abs(div.y - tile.y) == 1){
    //         div.classList.add('hint')
    //     }
    // })
}

export function canMove(animal,map,x,y){
    console.log('checking');
    
    const x1 = animal.point.x;
    const y1 = animal.point.y;
    let move = false;
    [[0,-1],[1,0],[0,1],[-1,0]].forEach((val)=>{
        console.log(val);
        
        let x2 = x1 + val[0];
        let y2 = y1 + val[1];
        let possible = false;
        if(x2 >= 0 && x2 <= 6 && y2 >= 0 && y2 <= 8){
            const foe = map[x2][y2].animal;
            if(!foe){
                if(map[x2][y2].base != -1){
                    if(map[x2][y2].base != animal.color){
                        possible = true;
                    }
                }else if(map[x2][y2].terrain == 'land' || animal.rank == 1){
                    possible = true;
                }else if(animal.rank == 6 || animal.rank == 7){
                    let valid = true;
                    let temp = null;
                    while(map[x2][y2].terrain != 'land'){
                        temp = map[x2][y2].animal;
                        if(!temp){
                            x2 += val[0]; y2 += val[1];
                        }else{
                            valid = false;
                            break;
                        }
                    }
                    temp = map[x2][y2].animal;
                    if(valid && (!temp || (animal.canEat(temp,map[x2][y2].trap) && temp.color != animal.color))){
                        possible = true;
                    }
                }
            }else if(foe.color != animal.color){
                if(animal.canEat(foe,map[x2][y2].trap) && (map[x1][y1].terrain == map[x2][y2].terrain)){
                    possible = true;
                }
            }
        }

        if(possible && x2 == x && y2 == y){
            move = true;
        }
    });
    console.log(move);
    
    return move;
}

