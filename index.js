window.onload = function() {
    var successSpecimen = document.getElementById('successSpecimen');
    var successSpecimenId = document.getElementById('successSpecimenId');
    var generations = document.getElementById('generations');

    var evolutionTarget = "sky above the port";
    var populationSize = 10000;
    var mutationRate = 0.02;

    var population = new Population(evolutionTarget, populationSize, mutationRate);
    population.init();

    console.log("Mutation Rate:");
    console.log(population.mutationRate);

    while(population.check() == -1) {

        population.calculateScore();
        population.createGenePool();

        console.log("Population");
        console.log(population.elements);
        console.log("GenePool");
        console.log(population.genePool);

        population.nextGeneration();

        // отрисовка результата
        var generationResult = population.check();
        if (generationResult != -1) {
            successSpecimen.innerHTML = population.elements[generationResult].dna;
        }
        else {
            successSpecimen.innerHTML = "EMPTY";
        }
        params.innerHTML = "Цель: " + evolutionTarget + " Размер популяции: " + populationSize + " Вероятность мутации: " + mutationRate;
        generations.innerHTML = population.generations;
        successSpecimenId.innerHTML = generationResult;

        // аварийная остановка, если эволюция зашла в тупик
        if (population.generations > 1000)
            break;
    }
}

class Population{
    constructor(target, size, mutationRate){
        this.generations = 0;
        // цель эволюции
        this.target = target;
        this.size = size;
        // вероятность мутации
        this.mutationRate = mutationRate;
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
            // количество генов элемента в генетическом пуле зависит от его score
            var num = Math.floor(this.elements[i].score / 10) + 1;
            
            for(var j = 0; j < num; j++)
                genePool.push(this.elements[i].dna);
        }
        this.genePool = genePool;
    }

    // создает ген из 2 случайных генов из генетического пула
    combineGenes(){
        var genePoolSize = this.genePool.length;
        var geneCenter = Math.floor(this.target.length / 2);
        for(var i = 0; i < this.size; i++) {
            // берем два случайных куска генов
            var parentGeneOne = this.genePool[(Math.floor(Math.random() * genePoolSize))];
            var parentGeneTwo = this.genePool[(Math.floor(Math.random() * genePoolSize))];
            var genePieceOne = parentGeneOne.slice(0, geneCenter);
            var genePieceTwo = parentGeneTwo.slice(geneCenter);
            // и создаем из них новый
            var newDna = genePieceOne + genePieceTwo;
            this.elements[i] = new Specimen(newDna, 0);
        }
    }

    mutate(){
        // существует вероятность мутации случайного символа в ДНК 
        // у каждого представителя популяции
        for(var i = 0; i < this.size; i++) {
            var dna = "";
            for(var j = 0; j < this.target.length; j++) {
                if (Math.random() < this.mutationRate){
                    console.log("Mutation!");
                    dna = dna.concat(getChar());
                }
                else
                    dna = dna.concat(this.elements[i].dna[j]);
            }
            this.elements[i].dna = dna;
        }
    }

    // создает следующую популяцию из генетического пула
    nextGeneration(){
        this.combineGenes();
        // и затем осуществляет случайные мутации
        this.mutate();
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

function getChar(){
    //var possible = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var possible = " abcdefghijklmnopqrstuvwxyz";
    return possible.charAt(Math.floor(Math.random() * possible.length));
}