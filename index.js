window.onload = function() {
    var data = document.getElementById('data');
    data.innerHTML = getChar();

    var population = new Population("test", 20000);
    population.init();
    population.calculateScore();

    console.log(population.elements);

    data.innerHTML = population.check();
}

function getChar(){
    //var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var possible = "abcdefghijklmnopqrstuvwxyz";
    return possible.charAt(Math.floor(Math.random() * possible.length));
}

class Population{
    constructor(target, size){
        this.generations = 0;
        this.target = target;
        this.size = size;
        // представители (Specimen) популяции
        this.elements = [];
        // для создания новых элементов популяции
        this.genePool = [];
    }

    // оценка индивидуального элемента популяции
    score(element){
        var score = 0;
        for(var i = 0; i < this.target.length; i++){
            if (element.charAt(i) == this.target.charAt(i))
                score++;
        }
        return Math.floor((score / this.target.length) * 100);
    }

    // создание популяции
    init(){
        for(var i = 0; i < this.size; i++){
            // создаем генетический код
            var gen = "";
            for(var j = 0; j < this.target.length; j++)
                gen = gen.concat(getChar());
            this.elements.push(new Specimen(gen, 0));
        }
    }

    calculateScore(){
        // оцениваем каждый элемент исходя из его ДНК
        for(var i = 0; i < this.size; i++)
            this.elements[i].score = this.score(this.elements[i].dna);
    }

    // шанс попасть в генетический пул выше для самых успешных представителей
    createGenePool(){
        var genePool = [];
        for(var i = 0; i < this.size; i++){
            // количество генов элемента в генетическом полу зависит от его score
            var num = floor(this.population.elements[i].score / 10) + 1;
            
            for(var j = 0; j < num; j++)
                genePool.push(this.population.elements[i].dna);
        }
        this.genePool = genePool;
    }

    // создает следующую популяцию из генетического пула
    nextGeneration(){

        this.generations++;
    }

    // проверяем на наличие требуемой ДНК
    check(){
        for(var i = 0; i < this.size; i++)
            if (this.elements[i].dna == this.target)
                return i;
        return -1;
    }
}

// представитель вида
class Specimen{
    constructor(dna, score){
        this.dna = dna;
        this.score = score;
    }
}