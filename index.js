import {Animal} from './animal.js';
import {init,draw,generate,canMove} from './map.js';
import {move,ai} from "./ai.js";

const map = init();
draw(map)

const text = `
    Masukne ID AI:
    0. AI as Blue
    1. AI as Red
    2. No AI
`
do{
    const id = prompt(text); 
    ai.id = parseInt(id);
}while(ai.id < 0 || ai.id > 2);


const span = document.querySelector('.mess')
const game = {
    turn: 0,
    active: null,
    end: false,
    setActive: function(animal){
        game.active = animal
        generate(animal,map)
    },
    changeTurn: function(x,y){
        map[game.active.point.x][game.active.point.y].animal = null;
        map[x][y].animal = game.active;
        game.active.point.x = x;
        game.active.point.y = y;
        game.active = null;
        draw(map)
        game.turn = (game.turn + 1)%2; // 0 Blue 1 Red
        game.updateSpan();
        
        const arrB = [],arrR = [];
        map.forEach((row)=> row.forEach(cell => {
            if(!cell.animal) return;
            if(cell.animal.color == 0){
                arrB.push(cell.animal);
            }else{
                arrR.push(cell.animal);
            }
        }))
        if(map[3][0].animal || map[3][8].animal || arrB.length <= 0 || arrR.length <=0){
            game.end =  true;
            const bluewin = game.turn;
            span.parentNode.innerHTML = '&nbsp;';
            const divmap = document.querySelector('.map');
            divmap.innerHTML += `
            <div class='credit' style='background-color:${bluewin?'darkblue':'maroon'}'>${ bluewin ? 'Blue' : 'Red'} Win</div>
            `
            divmap.style.backgroundColor = `${bluewin ? 'Blue' : 'Red'}`
            document.querySelectorAll('.tile').forEach( div => div.classList.add('trans'))
        }
        game.trigger();
    },
    updateSpan: function(){
        span.innerHTML = !game.turn ? 'Blue' : 'Red'
        span.style.color = !game.turn ? 'royalblue' : 'Red'
    },
    aimove: function(){
        const aip = move(map,ai.id)
        if(aip != null){
            game.setActive(map[aip.x1][aip.y1].animal)
            game.changeTurn(aip.x2,aip.y2);
        }else{
            console.log(aip);
        }
    },
    trigger: function(){
        if(ai.id == game.turn){
            setTimeout(() => {
                game.aimove();
            }, 500);
        }
    }
}

game.updateSpan();
game.trigger();

document.querySelectorAll('.tile').forEach((div)=>{
    const x = div.x;
    const y = div.y;
    div.onclick = ()=>{
        if(game.end)
            return;
        const animal = map[x][y].animal;
        if(animal){
            if(animal.color == game.turn){
                game.setActive(animal)
            }else if(game.active && canMove(game.active,map,x,y)){
                game.changeTurn(x,y);
            }else if(game.active){
                alert('cant move')
            }
        }else{
            if(game.active && canMove(game.active,map,x,y))
                game.changeTurn(x,y);
            else{
                alert('cant move')
            }
        }
    }
})

