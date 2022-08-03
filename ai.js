import { Animal } from "./animal.js"

export function move(map){
    ai.ctr = 0
    ai.point = null
    maxVal = -1000000;
    arrMap = [];
    const ret = alphaBetaPruning(map,ai.ply,Infinity,-Infinity,true)
    console.log(ai.ctr);

    // printOutCome(ret);
    return ai.point;
}

export const ai = {
    ply: 5,
    id: 0, // 0 blue 1 red
    ctr: 0,
}

let maxVal;

function printMap(map){
    let str = '';
    for(let i=0;i<9;i++){
        for(let j=0;j<7;j++){
            str+=map[j][i].animal? map[j][i].animal.rank : '_'
        }   
        str+='\n';
    }
    // console.log(str)
    return str;
}

let arrMap=[];
function printOutCome(ret){
    arrMap.forEach(element => {
        if(element.value == ret){
            console.log(element.ply);
            console.log(element.map);
        }
    })
}

function alphaBetaPruning(map,ply = ai.ply,alpha = Infinity,beta = -Infinity,aiturn = true){
    const isExit = exitSbe(map,ply,aiturn);
    if(isExit != null && ply != ai.ply){
        arrMap.push({
            value: isExit,
            "ply": ply,
            map: printMap(map)
        });
        return isExit;
    }

    if(ply == 0){
        const returnValue = sbe(map, ply, aiturn) ;
        maxVal = Math.max(maxVal,returnValue);
        if(returnValue >= maxVal){
            // console.log(maxVal);
            // printMap(map)
        }
        arrMap.push({
            value: returnValue,
            "ply": ply,
            map: printMap(map)
        });
        return returnValue;
    }

    let ret = aiturn ? -100000 : 100000;
    let pruning = false;
    map.forEach((row , ridx)=>{
        if(pruning)
            return;
        row.forEach((cell , cidx)=>{
            if(!cell.animal || pruning)
                return;
            if((aiturn && cell.animal.color == ai.id) || (!aiturn && cell.animal.color != ai.id)){
                const x1 = ridx, y1 = cidx;
                [[0,-1],[1,0],[0,1],[-1,0]].forEach((val)=>{
                    if(pruning)
                        return;
                    const cloneMap = JSON.parse(JSON.stringify(map))
                    const obj = JSON.parse(JSON.stringify(cell.animal));
                    const animal = new Animal(obj.rank,obj.color,[obj.x,obj.y]);
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
                        cloneMap[x1][y1].animal = null;
                        cloneMap[x2][y2].animal = animal;
                        animal.point.x = x2;
                        animal.point.y = y2;
                        // console.log(`Animal:${animal.rank} To:(${x2},${y2})`);
                        ai.ctr++;
                        const res = alphaBetaPruning(cloneMap, ply-1, alpha, beta, !aiturn);
                        ret = aiturn ? Math.max(res,ret) : Math.min(res,ret) 
                        
                        let cond = 0;
                        if(aiturn){
                            cond = ret >= beta ? 
                                ret > beta ? 2 : 1 : 
                                0;
                            beta = Math.max(ret,beta);
                        }else{
                            alpha = Math.min(ret,alpha);
                        }

                        
                        const useRandom = false &&  Math.random() > 0.5;
                        if(ply == ai.ply && cond!=0 && (cond == 2 || useRandom)){
                            ai.point = {
                                "x1": x1, "y1": y1,
                                "x2": x2, "y2": y2
                            }


                            console.log("Return:" + ret);
                            let output = `Point:(${ai.point.x1},${ai.point.y1}) to (${ai.point.x2},${ai.point.y2})`
                            console.log(output);
                            console.log(lastmap);
                            
                        }

                        if(alpha <= beta){
                            pruning = true;
                            return;
                        }

                    }
                });
            }
        })
    })
    arrMap.push({
        value: ret,
        ply: ply,
        map: printMap(map)
    });

    lastmap = printMap(map);
    return ret;
}

let lastmap = '';

function sbe(map , ply, aiturn){
    const neg = ai.id == 1 ? 1 : -1;
    const cost = ply * 0.1 * neg;
    if(map[3][0].animal)
        return -2000 * neg + cost;
    if(map[3][8].animal)
        return 2000 * neg + cost;
    let a = 0,b = 0;

    const arrB = [];
    const arrR = [];
    let mouseA,mouseB,elephantA,elephantB,tigerA,tigerB,lionA,lionB;
    mouseA = mouseB = elephantA = elephantB = tigerA = tigerB = lionA = lionB = null;
    map.forEach((row)=> row.forEach(cell => {   
        if(!cell.animal) return;
        cell.animal.color == ai.id ? 
            a+= (cell.animal.rank == 1 ? 6 : 0) + cell.animal.rank :
            b+= (cell.animal.rank == 1 ? 6 : 0) + cell.animal.rank ;
        if(cell.animal.color == ai.id){
            arrB.push(cell.animal);
            if(cell.animal.rank == 1){
                mouseA = cell.animal;
            }else if(cell.animal.rank == 6){
                tigerA = cell.animal;
            }else if(cell.animal.rank == 7){
                lionA = cell.animal;
            }else if(cell.animal.rank == 8){
                elephantA = cell.animal;
            }
        }else{
            arrR.push(cell.animal);
            if(cell.animal.rank == 1){
                mouseB = cell.animal;
            }else if(cell.animal.rank == 6){
                tigerB = cell.animal;
            }else if(cell.animal.rank == 7){
                lionB = cell.animal;
            }else if(cell.animal.rank == 8){
                elephantB = cell.animal;
            }
        }
    }))

    let returnValue = a-b;
    if(mouseA != null && elephantB != null && map[mouseA.point.x][mouseA.point.y].terrain != "water"){
        const distance = 
            Math.abs(mouseA.point.x - elephantB.point.x) +
            Math.abs(mouseA.point.y - elephantB.point.y) ;
        if(distance <= 1 || (distance <= 2 && aiturn)){
            returnValue += distance == 1 && aiturn ? 7.5 : 3.5;
        }
    }
    if(mouseB != null && elephantA != null && map[mouseB.point.x][mouseB.point.y].terrain != "water"){
        const distance = 
            Math.abs(mouseB.point.x - elephantA.point.x) +
            Math.abs(mouseB.point.y - elephantA.point.y) ;
        if(distance <= 1 || (distance <= 2 && !aiturn)){
            returnValue -= distance == 1 && !aiturn ? 7.5 : 3.5;
        }
    }

    if(elephantA != null){
        returnValue -= elephantA.color == 0 ?
            0.01 * Math.abs(0 - elephantA.point.y) :
            0.01 * Math.abs(8 - elephantA.point.y) ;
    }

    if(elephantB != null){
        returnValue += elephantB.color == 0 ?
            0.01 * Math.abs(0 - elephantB.point.y) :
            0.01 * Math.abs(8 - elephantB.point.y) ;
    }

    if(lionA != null){
        returnValue += lionTigerMobility(lionA);
    }
    
    if(lionB != null){
        returnValue -= lionTigerMobility(lionB);
    }

    
    if(tigerA != null){
        returnValue += lionTigerMobility(tigerA);
    }
    
    if(tigerB != null){
        returnValue -= lionTigerMobility(tigerB);
    }
    
    if(lionA != null && tigerA != null){
        let distance = 
            Math.abs(lionA.point.x - tigerA.point.x) + 
            Math.abs(lionA.point.y - tigerA.point.y) ;
        returnValue -= distance == 1 ? 2 : 0;
    }

    if(lionB != null && tigerB != null){
        let distance = 
            Math.abs(lionB.point.x - tigerB.point.x) + 
            Math.abs(lionB.point.y - tigerB.point.y) ;
        returnValue += distance == 1 ? 2 : 0;
    }
    
    return returnValue + cost;
}

function lionTigerMobility(animal){
    let minDistance = 1000;
    [[3,3],[3,4],[3,5]].forEach(point => {
        let tempDist = Math.abs(animal.point.x - point[0]) + Math.abs(animal.point.y - point[1]);
        minDistance = tempDist < minDistance ? tempDist : minDistance;
    });
    
    let ret = 0.05 - 0.01*minDistance + (Math.random() > (animal.rank == 7 ? 0.8 : 0.2) ? 0.001 : 0);
    return ret;
}

function exitSbe(map,ply,aiturn){
    const neg = ai.id == 1  ? 1 : -1
    const blueTurn = aiturn ? ai.id == 0 : ai.id == 1;
    let ret = null;

    ply++;

    //biru sampek goal
    if(map[3][0].animal){
        ret = -2000 * ply * neg;
    }
    
    //merah sampek goal
    else if(map[3][8].animal){
        ret =  2000 * ply * neg;
    }

    else{
        const arrB = [];
        const arrR = [];
        map.forEach((row)=> row.forEach(cell => {
            if(!cell.animal) return;
            if(cell.animal.color == 0){
                arrB.push(cell.animal);
            }else{
                arrR.push(cell.animal);
            }
        }))

        if(arrB.length == 0){
            ret = 5000 * ply * neg;
        }else if(arrR.length == 0){
            ret = -5000 * ply * neg;
        }else{
            const trapR = [[2,0],[3,1],[4,0]]
            const trapB = [[2,8],[3,7],[4,8]]

            arrB.forEach(blue => {
                if(ret != null)
                    return;
                if(map[blue.point.x][blue.point.y].trap == 1){
                    let valid = true;
                    arrR.forEach(red => {
                        if(!valid)
                            return;
                        valid = Math.abs(blue.point.x - red.point.x) + Math.abs(blue.point.y - red.point.y) > 1 
                    })
                    valid = valid && blueTurn;
                    if(valid){
                        ret = -1000 * ply * neg;
                        return ret;
                    }
                }else{
                    let valid = true;
                    trapR.forEach(trap => {
                        if(ret != null)
                            return;
                        let distance = Math.abs(blue.point.x - trap[0]) + Math.abs(blue.point.y - trap[1]);
                        arrR.forEach(red => {
                            if(!valid)
                                return;
                            valid = Math.abs(red.point.x - trap[0]) + Math.abs(red.point.y - trap[1]) > distance &&
                                    Math.abs(blue.point.x - red.point.x) + Math.abs(blue.point.y - red.point.y) > 1;
                        })
                        valid = valid && blueTurn;
                        if(valid){
                            ret = -1000 * ply * neg;
                        }
                    })

                    if(valid){
                        return ret;
                    }
                }
            })

            arrR.forEach(red => {
                if(ret != null)
                    return;
                if(map[red.point.x][red.point.y].trap == 0){
                    let valid = true;
                    arrB.forEach(blue => {
                        if(!valid)
                            return;
                        valid = Math.abs(blue.point.x - red.point.x) + Math.abs(blue.point.y - red.point.y) > 1 
                    })
                    valid = valid && !blueTurn;
                    if(valid){
                        ret = 1000 * ply * neg;
                        return ret;
                    }
                }else{
                    let valid = true;
                    trapB.forEach(trap => {
                        if(ret != null)
                            return;
                        let distance = Math.abs(red.point.x - trap[0]) + Math.abs(red.point.y - trap[1]);
                        arrB.forEach(blue => {
                            if(!valid)
                                return;
                            valid = Math.abs(blue.point.x - trap[0]) + Math.abs(blue.point.y - trap[1]) > distance &&
                                    Math.abs(blue.point.x - red.point.x) + Math.abs(blue.point.y - red.point.y) > 1;
                        })
                        valid = valid && !blueTurn;
                        if(valid){
                            ret = 1000 * ply * neg;
                        }
                    })

                    if(valid){
                        return ret;
                    }
                }
            })
        }
    }

    return ret;
}