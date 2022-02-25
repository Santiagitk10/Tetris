
// setInterval(() => {
//     tetrimino.moveDown();
// },200);

const boardMargin= 10;
let regulador_valocidad_teclaOprimida = 0;
let lineas_hechas = 0

function setup(){
    createCanvas();
    crearMapeoBaseTetriminos();
    board = new Board();
    tetrimino = new Tetrimino();
    resizeCanvas(board.width + 2 * boardMargin, board.height + 2* boardMargin + board.side);
}

function draw(){
    background("lightgray");
    board.dibujar();
    tetrimino.dibujar();
    keyEventsTetris();
}


function keyEventsTetris(){
    if(millis() - regulador_valocidad_teclaOprimida < 100){
        return
    }

    regulador_valocidad_teclaOprimida = millis();
    if(keyIsDown(RIGHT_ARROW)){
        tetrimino.moveRight();
    }
    if(keyIsDown(LEFT_ARROW)){
        tetrimino.moveLeft();
    }
    if(keyIsDown(UP_ARROW)){
        tetrimino.rotate();
    }
    if(keyIsDown(DOWN_ARROW)){
        tetrimino.moveDown();
    }
}





class Board{
    constructor(){
        this.columns = 16;
        this.rows = 32;
        this.side = 25;
        this.width = this.columns*this.side;
        this.height = this.rows*this.side;
        this.position = createVector(boardMargin ,boardMargin +  this.side);
        this.memory = [];
        for(let row = 0; row < this.rows; row++){
            this.memory[row] = [];
            for(let column = 0; column < this.columns; column++){
                this.memory[row].push('');
            }
        }
    }

    set storeTetrimino(tet){
        for(const posMino of tet.mapaTablero){
            if(posMino.y < 35){
                //juego ha terminado
                board = new Board();
                tetrimino = new Tetrimino();
                lineas_hechas = 0;
            }
            this.memory[parseInt(posMino.y/25-1)][parseInt(posMino.x/25)] = tet.name;
        }
        this.selectHorizontalLinesToErase();
    }

    selectHorizontalLinesToErase(){
        let lineas = [];
        for (let fila = this.rows-1; fila >= 0; fila--) {
            let agregar = true;
            for (let columna = 0; columna < this.columns; columna++) {
                if (!this.memory[fila][columna]) {
                    agregar = false;
                    break;
                }
            }
            if (agregar) {
                lineas.push(fila);
            }
        }

        this.eraseHorizontalLines(lineas);
    }

    eraseHorizontalLines(lineas){
        lineas_hechas += lineas.length;
        for (const linea of lineas) {
            for (let fila = linea; fila >= 0; fila--) {
                for (let columna = 0; columna < this.columns; columna++) {
                    if (fila == 0) {
                        this.memory[fila][columna] = "";
                        continue;
                    }
                    this.memory[fila][columna] =
                        this.memory[fila -1][columna];
                }
            }
        }

        console.log(this.memory)
    }



    coordenada(x,y){
        return createVector(x,y).mult(this.side).add(this.position);
    }

    dibujar(){ 
        push()
        noStroke();
        for(let column = 0; column < this.columns;column++){
            for(let row = 0; row < this.rows;row++){
                if((column+row)%2 == 0){
                    fill("black")
                } else {
                    fill("#003")
                }
                let c = this.coordenada(column,row);
                rect(c.x,c.y,this.side);
            }
        }
        pop()
        this.paintStoredMinos();
    }

    paintStoredMinos(){
        push();
        for(let column = 0; column < this.columns; column++){
            for(let row = 0; row < this.rows; row++){
                let nombreMino = this.memory[row][column];
                if(nombreMino){
                    fill(baseTetriminos[nombreMino].color);
                    Tetrimino.paintMino(this.coordenada(column, row));
                }
            
            }
        }
        pop();
    }




}


function crearMapeoBaseTetriminos(){
    baseTetriminos = {
        'Z' : {
            color : 'red',
            mapa : [
                createVector(),
                createVector(-1,-1),
                createVector(0,-1),
                createVector(1,0),
            ]
        },
        'S' : {
            color : 'green',
            mapa : [
                createVector(),
                createVector(0,-1),
                createVector(1,-1),
                createVector(-1,0),
            ]
        },
        'L' : {
            color : 'orange',
            mapa : [
                createVector(),
                createVector(-1,-1),
                createVector(-1,0),
                createVector(1,0),
            ]
        },
        'J' : {
            color : 'blue',
            mapa : [
                createVector(),
                createVector(1,-1),
                createVector(-1,0),
                createVector(1,0),
            ]
        },
        'O' : {
            color : 'yellow',
            mapa : [
                createVector(),
                createVector(1,-1),
                createVector(0,-1),
                createVector(1,0),
            ]
        },
        'T' : {
            color : 'magenta',
            mapa : [
                createVector(),
                createVector(1,0),
                createVector(0,-1),
                createVector(-1,0),
            ]
        },
        'I' : {
            color : 'cyan',
            mapa : [
                createVector(),
                createVector(1,0),
                createVector(2,0),
                createVector(-1,0),
            ]
        }
    }
}




class Tetrimino{
    constructor(name = random(['Z','S','L','J','O','T','I'])){
        this.name = name;
        let baseTetrimino = baseTetriminos[name];
        this.color = baseTetrimino.color;
        this.mapa = [];
        for(const posMino of baseTetrimino.mapa){
            this.mapa.push(posMino.copy())
        }
        this.position = createVector(board.columns/2,0);

    
    }

    get mapaTablero(){
        let retorno = [];
        for(const posMino of this.mapa){
            let copy = posMino.copy().add(this.position)
            retorno.push(board.coordenada(copy.x,copy.y))
        }

        return retorno;
    }


    moveRight(){
        this.position.x++;
        let isOut = !this.isInsideBoard || this.colisionConMinosAlmacenados;
        if(isOut){
            this.moveLeft();
        }
    }

    moveLeft(){
        this.position.x--;
        let isOut = !this.isInsideBoard || this.colisionConMinosAlmacenados;;
        if(isOut){
            this.moveRight();
        }
    }

    moveUp(){
        this.position.y--;
        
    }

    moveDown(){
        this.position.y++;
        let isOut = !this.isInsideBoard || this.colisionConMinosAlmacenados;;
        if(isOut){
            this.moveUp();
            board.storeTetrimino = this;
            tetrimino = new Tetrimino();
        }
    }


    rotate(){
        for(const posMin of this.mapa){
            posMin.set(posMin.y,-posMin.x)
        }
        let isOut = !this.isInsideBoard || this.colisionConMinosAlmacenados;;
        if(isOut){
            this.undoRotate();
        }
    }

    undoRotate(){
        for(const posMin of this.mapa){
            posMin.set(-posMin.y,posMin.x)
        }
    }

    get isInsideBoard(){
        for(const posMino of this.mapaTablero){
            if(posMino.x < 0){ //Evita salida por la izquierda
                return false;
            }
            if(posMino.x >= board.width){//Evita salida por la derecha
                return false;
            }

            if(posMino.y  >= board.height+25){//Evita salida por abajo
                return false;
            }
        }

        return true;
    }

    get colisionConMinosAlmacenados(){
        for(const pmino of this.mapaTablero){
            if(board.memory[parseInt(pmino.y/25-1)][parseInt(pmino.x/25)]){
                return true 
            }
        }

        return false;
    }

    dibujar(){
        push();
        fill(this.color);
        for(const posMino of this.mapaTablero){
            Tetrimino.paintMino(posMino);
        }
        pop();
    }

     static paintMino(posMino){
        rect(posMino.x,posMino.y,board.side)
        push();
        noStroke();
        fill(255,255,255,80)
        beginShape();
        vertex(posMino.x,posMino.y);
        vertex(posMino.x + board.side,posMino.y);
        vertex(posMino.x + board.side,posMino.y +board.side);
        endShape(CLOSE);
        beginShape();
        fill(0,0,0,80)
        vertex(posMino.x,posMino.y);
        vertex(posMino.x,posMino.y + board.side);
        vertex(posMino.x + board.side,posMino.y +board.side);
        endShape(CLOSE);
        pop();
    }
}





































