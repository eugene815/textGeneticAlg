function initAlgorithm() {
    var successSpecimen = document.getElementById('successSpecimen');
    var successSpecimenId = document.getElementById('successSpecimenId');
    var generations = document.getElementById('generations');
    var timeSlot = document.getElementById('spent-time');
    var evolutionTarget, populationSize, mutationRate;

    console.log('%cПоиск параметров', "color:darkgreen;");

    evolutionTarget = document.getElementById('evolution-target').value;
    populationSize = parseInt(document.getElementById('population-size').value);
    mutationRate = parseFloat(document.getElementById('mutation-rate').value);

    
    if(!evolutionTarget){
        evolutionTarget = "sky above the port";
    }
    if(!populationSize){
        populationSize = 10000;
    }
    if(!mutationRate){
        mutationRate = 0.02;
    }

    console.log('Итоговые настройки:')
    console.log('Цель эволюции ' + evolutionTarget);
    console.log('Размер популяции ' + populationSize);
    console.log('Вероятность мутации ' + mutationRate);

    var population = new Population(evolutionTarget, populationSize, mutationRate);
    
    population.init();

    console.log("Mutation Rate:");
    console.log(population.mutationRate);
    var startDate = new Date();
    new Promise(function(resolve, reject){
        var generationResult = null;
        var results = {};
        while(population.check() == -1) {

            population.calculateScore();
            population.createGenePool();

        /*
            console.log("Population");
            console.log(population.elements);
            console.log("GenePool");
            console.log(population.genePool);
        */

            population.nextGeneration();

            // отрисовка результата
            generationResult = population.check();

            // аварийная остановка, если эволюция зашла в тупик
            if (population.generations >= 1000) {
                reject('Экстренный выход. Превышено кол-во итераций.');
                console.log("Population");
                console.log(population.elements); 
                console.log("GenePool"); 
                console.log(population.genePool);
                break;
            } else {
                console.log('Поколение #' + population.generations);
            }
        }
        results.successSpecimen = population.elements[generationResult].dna;
        results.generations = population.generations;
        results.successSpecimenId = generationResult;
        resolve(results);

    }).then(function(results){
        var endDate = new Date();
        timeSlot.innerHTML = (endDate - startDate)/1000 + ' секунд';
        console.log('%cДанные получены', 'color:darkgreen;');
        successSpecimen.innerHTML = results.successSpecimen;
        successSpecimenId.innerHTML = results.successSpecimenId;
        generations.innerHTML = results.generations;
    }).catch(function(error){
        alert(error);
    });
};
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
        var mutationsCount = 0;
        for(var i = 0; i < this.size; i++) {
            var dna = "";
            for(var j = 0; j < this.target.length; j++) {
                if (Math.random() < this.mutationRate){
                    mutationsCount++;
                    dna = dna.concat(getChar());
                }
                else
                    dna = dna.concat(this.elements[i].dna[j]);
            }
            this.elements[i].dna = dna;
        }
        console.log("Количество мутаций: " + mutationsCount);
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