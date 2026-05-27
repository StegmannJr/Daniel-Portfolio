let pokedexList = [];
let KantoPokedex = [];

let playerParty = [];
let currentPartyIndex = 0;

let playerPokemon = {};
let opponentPokemon = {};

let currentMenuState = "start";
let isBattleActive = false;
let isPlayerTurn = true;

let isLearningMove = false;
let moveToLearn = null;

let encouterpool = [16, 19, 10, 13, 21, 29, 32];

let playerLevel = 5;
let playerXP = 0;
let xpNeededForLevel = 100;

let isEvolving = false;
let evolutionIDTarget = null;
let evolutionTargetName = "";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const levelOffSet = Math.floor(Math.random() * 3) - 1;

let opponentLevel = Math.max(2, playerLevel + levelOffSet);

let playerStats = {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
}

let opponentStats = {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0
}

const typeChart = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5},
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2},
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5},
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5},
    electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5},
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5},
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5},
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2},
    ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2},
    flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5},
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5},
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5},
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5},
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5},
    dragon: { dragon: 2, steel: 0.5, fairy: 0},
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5},
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2},
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5}
}

const natureData = {
    Hardy:    { plus: null, minus: null },
    Lonely:   { plus: "attack", minus: "defense" },
    Brave:    { plus: "attack", minus: "speed" },
    Adamant:  { plus: "attack", minus: "specialAttack" },
    Naughty:  { plus: "attack", minus: "specialDefense" },
    Bold:     { plus: "defense", minus: "attack" },
    Docile:   { plus: null, minus: null },
    Relaxed:  { plus: "defense", minus: "speed" },
    Impish:   { plus: "defense", minus: "specialAttack" },
    Lax:      { plus: "defense", minus: "specialDefense" },
    Timid:    { plus: "speed", minus: "attack" },
    Hasty:    { plus: "speed", minus: "defense" },
    Serious:  { plus: null, minus: null },
    Jolly:    { plus: "speed", minus: "specialAttack" },
    Naive:    { plus: "speed", minus: "specialDefense" },
    Modest:   { plus: "specialAttack", minus: "attack" },
    Mild:     { plus: "specialAttack", minus: "defense" },
    Quiet:    { plus: "specialAttack", minus: "speed" },
    Bashful:  { plus: null, minus: null },
    Rash:     { plus: "specialAttack", minus: "specialDefense" },
    Calm:     { plus: "specialDefense", minus: "attack" },
    Gentle:   { plus: "specialDefense", minus: "defense" },
    Sassy:    { plus: "specialDefense", minus: "speed" },
    Careful:  { plus: "specialDefense", minus: "specialAttack" },
    Quirky:   { plus: null, minus: null }
}

const worldMap = {
    "Palet Town": {
        name: "Palet Town",
        requiredWaves: 0,
        spawnPool: [],
        nextZones: ["Route 1"]
    },
    "Route 1": {
        name: "Route 1",
        requiredWaves: 10,
        spawnPool: [16, 19],
        minLevel: 2,
        maxLevel: 5,
        nextZones: ["Viridian City"]
    },
    "Viridian City": {
        name: "Viridian City",
        requiredWaves: 1, /* Locked until 7th badge - Giovanni */
        spawnPool: [],
        nextZones: ["Route 22", "Route 2"]
    },
    "Route 22": {
        name: "Route 22",
        requiredWaves: 10,
        spawnPool: [19, 21, 56],
        minLevel: 2,
        maxLevel: 5,
        nextZones: ["Route 23" /* is locked until Giovani is beaten as 8th gym badge*/]
    },
    "Route 2-South": {
        name: "Route 2",
        requiredWaves: 5,
        spawnPool: [10, 13, 16, 19],
        minLevel: 3,
        maxLevel: 5,
        nextZones: ["Viridian Forest"]
    },
    "Viridian Forest": {
        name: "Viridian Forest",
        requiredWaves: 10,
        spawnPool: [10, 11, 13, 14, 25],
        minLevel: 3,
        maxLevel: 6,
        nextZones: ["Route 2-North"]
    },
    "Route 2-North": {
        name: "Route 2",
        requiredWaves: 5,
        spawnPool: [10, 16, 19],
        minLevel: 3,
        maxLevel: 5,
        nextZones: ["Pewter City"]
    },
    "Pewter City": {
        name: "Pewter City",
        requiredWaves: 1, /* Brock */
        spawnPool: [],
        nextZones: ["Route 3"]
    },
    "Route 3": {
        name: "Route 3",
        requiredWaves: 10,
        spawnPool: [16, 21, 29, 32, 39, 56],
        minLevel: 6,
        maxLevel: 7,
        nextZones: ["Mt. Moon"]
    },
    "Mt. Moon": {
        name: "Mt. Moon",
        requiredWaves: 10,
        spawnPool: [39, 41, 46, 74],
        minLevel: 5,
        maxLevel: 12,
        nextZones: ["Route 4"]
    },
    "Route 4": {
        name: "Route 4",
        requiredWaves: 10,
        spawnPool: [16, 21, 23, 27, 56],
        minLevel: 6,
        maxLevel: 12,
        nextZones: ["Cerulean City"]
    },
    "Cerulean City": {
        name: "Cerulean City",
        requiredWaves: 1, /* Misty */
        spawnPool: [],
        nextZones: ["Route 24", "Route, 9" /* Route 9 is locked untill Lt. Surge is beaten */, "Route 5, Cerulean Cave" /* Locked untill champion */]
    },
    "Route 24": {
        name: "Route 24",
        requiredWaves: 10,
        spawnPool: [10, 11, 13, 14, 16, 43, 63, 69],
        minLevel: 7,
        maxLevel: 14,
        nextZones: ["Route 25"]
    },
    "Route 25": {
        name: "Route 25",
        requiredWaves: 10,
        spawnPool: [10, 11, 13, 14, 16, 43, 63, 69],
        minLevel: 7,
        maxLevel: 14,
        nextZones: ["Cerulean City"]
    },
    "Route 5": {
        name: "Route 5",
        requiredWaves: 10,
        spawnPool: [16, 43, 52, 69],
        minLevel: 10,
        maxLevel: 16,
        nextZones: ["Route 6", "Saffron City" /* Saffron city is locked untill later */]
    },
    "Route 6": {
        name: "Route 6",
        requiredWaves: 10,
        spawnPool: [16, 43, 52, 69],
        minLevel: 10,
        maxLevel: 16,
        nextZones: ["Vermillion City"]
    },
    "Vermillion City": {
        name: "Vermillion City",
        requiredWaves: 1, /* Lt. Surge */
        spawnPool: [],
        nextZones: ["Route 11"]
    },
    "Route 11": {
        name: "Route 11",
        requiredWaves: 10,
        spawnPool: [21, 23, 27, 96],
        minLevel: 11,
        maxLevel: 17,
        nextZones: ["Diglets Tunnel", "Route 12", "Route 13" /* Route 12-13 is locked until player moves through Route 9 => 
            Rock Tunnel => Route 10 => lavender town and beats Snolax */]
    },
    "Route 9": {
        name: "Route 9",
        requiredWaves: 10,
        spawnPool: [19, 21, 23, 27],
        minLevel: 11,
        maxLevel: 17,
        nextZones: ["Route 10-North"]
    },
    "Route 10-North": {
        name: "Route 10",
        requiredWaves: 5,
        spawnPool: [21, 23, 27, 100],
        minLevel: 11,
        maxLevel: 17,
        nextZones: ["Rock Tunnel", "Power Plant" /* Power Plant is locked untill after beating koga for 6th Badge */]
    },
    "Rock Tunnel": {
        name: "Rock Tunnel",
        requiredWaves: 10,
        spawnPool: [41, 56, 66, 74, 95],
        minLevel: 13,
        maxLevel: 17,
        nextZones: ["Route 10-South"]
    },
    "Power Plant": {
        name: "Power Plant",
        requiredWaves: 10,
        spawnPool: [25, 81, 82, 100, 101, 125, 145],
        minLevel: 22,
        maxLevel: 50
    },
    "Route 10-South": {
        name: "Route 10",
        requiredWaves: 5,
        spawnPool: [21, 23, 66, 100, ]
    },
    "Lavender Town": {
        name: "Lavender Town",
        requiredWaves: 0, /* pokemon Tower is its own area */
        spawnPool: [],
        nextZones: ["Pokemon Tower" /* Locked until defeating rocket game corner */, "Route 8", "Route 12"]
    },
    "Route 8": {
        name: "Route 8",
        requiredWaves: 10,
        spawnPool: [16, 23, 27, 37, 52, 58],
        minLevel: 15,
        maxLevel: 20,
        nextZones: ["Saffron City" /* Locked until beating rocket game corner */, "Route 7"]
    },
    "Route 7": {
        name: "Route 7",
        requiredWaves: 10,
        spawnPool: [16, 37, 43, 52, 58, 69],
        minLevel: 17,
        maxLevel: 22,
        nextZones: ["Celadon City"] 
    },
    "Celadon City": {
        name: "Celadon City",
        requiredWaves: 1, /* Erica */
        spawnPool: [],
        nextZones: ["Rocket Game Corner", "Route 16" /* Requires beating Snorlax which requires beating pokemon tower */]
    },
    "Rocket Game Corner": {
        name: "Rocket Game Corner",
        requiredWaves: 1,
        spawnPool: []
    },
    "Pokemon Tower": { /* Unlocks fighting snorlax and silph co. */
        name: "Pokémon Tower",
        requiredWaves: 10,
        spawnPool: [92, 93, 104],
        minLevel: 13,
        maxLevel: 25 
    },
    "Fighting Dojo": {
        name: "Fighting Dojo",
        requiredWaves: 1,
        spawnPool: []
    },
    "Silph Co.": {
        name: "Silph Co.",
        requiredWaves: 1,
        spawnPool: []
    },
    "Snorlax": {
        name: "Snorlax",
        requiredWaves: 1,
        spawnPool: [143],
        minLevel: 30,
        maxLevel: 30
    },
    "Route 16": {
        name: "Route 16",
        requiredWaves: 10,
        spawnPool: [19, 20, 21, 84],
        minLevel: 18,
        maxLevel: 25,
        nextZones: ["Route 17"]
    },
    "Route 17": {
        name: "Route 17",
        requiredWaves: 10,
        spawnPool: [19, 20, 21, 22, 84],
        minLevel: 20,
        maxLevel: 29,
        nextZones: ["Route 18"]
    },
    "Route 18": {
        name: "Route 18",
        requiredWaves: 10,
        spawnPool: [19, 20, 21, 22, 84],
        minLevel: 20,
        maxLevel: 29,
        nextZones: ["Fuchia City"]
    },
    "Route 13": {
        name: "Route 13",
        requiredWaves: 10,
        spawnPool: [16, 17, 43, 44, 48, 69, 70, 72, 83, 98, 116, 129, 132],
        minLevel: 22,
        maxLevel: 30,
        nextZones: ["Route 14"]
    },
    "Route 14": {
        name: "Route 14",
        requiredWaves: 10,
        spawnPool: [16, 17, 43, 44, 48, 69, 70, 132],
        minLevel: 22,
        maxLevel: 30,
        nextZones: ["Route 15"]
    },
    "Route 15": {
        name: "Route 15",
        requiredWaves: 10,
        spawnPool: [16, 17, 43, 44, 48, 69, 70, 132],
        minLevel: 22,
        maxLevel: 30,
        nextZones: ["Fuchia City"]
    },
    "Fuchia City": {
        name: "Fuchia City",
        requiredWaves: 1, /* Koga */
        spawnPool: [],
        nextZones: ["Safari Zone", "Route 19"]
    },
    "Safari Zone": {
        name: "Safari Zone",
        requiredWaves: 10,
        spawnPool: [29, 30, 32, 33, 46, 47, 48, 49, 54, 60, 79, 84, 102, 111, 113, 115, 118, 119, 123, 127, 128, 129, 147, 148],
        minLevel: 20,
        maxLevel: 40
    },
    "Route 19": {
        name: "Route 19",
        requiredWaves: 10,
        spawnPool: [72, 98, 116, 129],
        minLevel: 5,
        maxLevel: 35,
    },
    "Seafoam Islands": {
        name: "Seafoam Islands",
        requiredWaves: 10,
        spawnPool: [41, 42, 54, 55, 79, 80, 86, 98, 116, 129, 144],
        minLevel: 22,
        maxLevel: 50,
        nextZones: ["Route 20"]
    },
    "Route 20": {
        name: "Route 20",
        requiredWaves: 10,
        spawnPool: [72, 90, 98, 116, 120, 129],
        minLevel: 5,
        maxLevel: 40,
        nextZones: ["Cinnabar Island"]
    },
    "Cinnabar Island": {
        name: "Cinnabar Island",
        requiredWaves: 1, /* Blaine */
        spawnPool: [],
        nextZones: ["Pokemon Mansion", "Route 21", "One Island"]
    },
    "Pokemon Mansion": {
        name: "Pokémon Mansion",
        requiredWaves: 10,
        spawnPool: [19, 20, 37, 58, 88, 89, 109, 110, 132, 126],
        minLevel: 26,
        maxLevel: 38
    },
    "Route 21": {
        name: "Route 21",
        requiredWaves: 10,
        spawnPool: [72, 90, 98, 114, 116, 120, 129],
        minLevel: 5,
        maxLevel: 40,
        nextZones: ["Palet Town"]
    },
    "One Island": {
        name: "One Island",
        requiredWaves: 0,
        spawnPool: [],
        nextZones: ["Treasure Beach", "Kindle Road", "Two Island", "Three Island" /* Needs to have visited "Two Island" first */]
    },
    "Treasure Beach": {
        name: "Treasure Beach",
        requiredWaves: 10,
        spawnPool: [21, 22, 52, 53, 54, 72, 73, 79, 98, 113, 116, 129],
        minLevel: 5,
        maxLevel: 40,
        nextZones: ["one Island"]
    },
    "kindle Road": {
        name: "Kindle Road",
        requiredWaves: 10,
        spawnPool: [21, 22, 52, 53, 54, 72, 73, 74, 77, 78, 79, 98, 116, 129],
        minLevel: 5,
        maxLevel: 40,
        nextZones: ["one Island", "Mt. Ember"]
    },
    "Mt. Ember": {
        name: "Mt. Ember",
        requiredWaves: 10,
        spawnPool: [19, 20, 66, 67, 74, 75, 77, 78, 126, 146],
        minLevel: 5,
        maxLevel: 50,
        nextZones: ["One Island"]
    },
    "Two Island": {
        name: "Two Island",
        requiredWaves: 0,
        spawnPool: [],
        nextZones: ["One Island", "Cape Brink", "Three Island"]
    },
    "Cape Brink": {
        name: "Cape Brink",
        requiredWaves: 10,
        spawnPool: [21, 22, 43, 44, 52, 53, 54, 55, 60, 69, 70, 79, 80, 118, 129],
        minLevel: 5,
        maxLevel: 40,
        nextZones: ["two Island"]
    },
    "Three Island": {
        name: "Three Island",
        requiredWaves: 4, /* Biker gang */
        spawnPool: [],
        nextZones: ["One Island", "Two Island", "Bond Bridge" /* Needs biker gang to be beaten */]
    },
    "Bond Bridge": {
        name: "Bond Bridge",
        requiredWaves: 10,
        spawnPool: [16, 17, 43, 44, 48, 52, 53, 54, 69, 70, 72, 73, 79, 98, 116, 129],
        minLevel: 5,
        maxLevel: 40,
        nextZones: ["Berry Forest"]
    },
    "Berry Forest": {
        name: "Berry Forest",
        requiredWaves: 10,
        spawnPool: [16, 17, 43, 44, 48, 49, 54, 55, 60, 69, 70, 79, 80, 96, 97, 102, 118, 129],
        minLevel: 5,
        maxLevel: 40,
        nextZones: ["Three Island"]
    },
    "Route 23": {
        name: "Route 23",
        requiredWaves: 10,
        spawnPool: [21, 22, 23, 24, 27, 28, 54, 56, 57, 60, 79, 118, 129],
        minLevel: 20,
        maxLevel: 45,
        nextZones:["Victory Road"]
    },
    "Victory Road": {
        name: "Victory Road",
        requiredWaves: 10,
        spawnPool: [24, 28, 41, 42, 57, 66, 67, 74, 95, 105],
        minLevel: 32,
        maxLevel: 48,
        nextZones: ["Indigo Plateau"]
    },
    "Indigo Plateau": {
        name: "Indigo Plateau",
        requiredWaves: 5, /* 1: Lorelei, 2: Bruno, 3: Agatha, 4: Lance, 5: Blue */
        spawnPool: [],
        nextZones: ["Palet Town"]
    }
}

function createUniqueInstances(apiTemplate, chosenLevel) {
    const ivs = {
        hp: Math.floor(Math.random() * 32),
        attack: Math.floor(Math.random() * 32),
        defense: Math.floor(Math.random() * 32),
        specialAttack: Math.floor(Math.random() * 32),
        specialDefense: Math.floor(Math.random() * 32),
        speed: Math.floor(Math.random() * 32),
    };

    const natureList = object.Keys(natureData);
    const randomNature = natureList[Math.floor(Math.random() * natureList.length)];

    const nativeMoves = apiTemplate.moves.mp(m => ({
        name: m.name,
        power: m.power,
        type: m.type,
        damageClass: m.damageClass,
        accuracy: m.accuracy,
        maxPP: m.maxPP,
        currentPP: m.maxPP
    }));

    return {
        id: apiTemplate.id,
        name: apiTemplate.name,
        types: apiTemplate.types,
        level: chosenLevel,
        currentXP: 0,
        baseStats: apiTemplate.baseStats,
        ivs: ivs,
        nature: randomNature,
        moves: nativeMoves,
        currentHP: null,
        maxHP: null
    };
}

function checkNewMovesForLevels(apiData, level) {
    const newMoves = [];

    apiData.moves.forEach(moveData => {
        const details = moveData.version_group_details[0];

        if (details && details.move_learn_method.name === "level-up") {
            if (details.level_learned_at === level) {
                newMoves.push({
                    name: moveData.move.name,
                    url: moveData.move.url
                });
            }
        }
    });

    return newMoves;
}

async function checkEvolution() {
    if (isEvolving) return;

    try {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${playerPokemon.id}`);
        const speciesData = await speciesResponse.json();

        const chainResponse = await fetch(speciesData.evolution_chain.url);
        const chainData = await chainResponse.json();

        let currentChainNode = chainData.chain;
        let nextEvolutionDetails = null;

        while (currentChainNode) {
            if (currentChainNode.species.name === playerPokemon.name.toLowerCase()) {
                
                if (currentChainNode.creates_with && currentChainNode.creates_with.length > 0) {
                    nextEvolutionDetails = currentChainNode.creates_with[0];
                } 
                else if (currentChainNode.evolves_to && currentChainNode.evolves_to.length > 0) {
                    nextEvolutionDetails = currentChainNode.evolves_to[0];
                }
                break;
            }
            currentChainNode = currentChainNode.evolves_to ? currentChainNode.evolves_to[0] : null;
        }
        if (nextEvolutionDetails && nextEvolutionDetails.evolution_details && nextEvolutionDetails.evolution_details.length > 0) {
            const details = nextEvolutionDetails.evolution_details[0];

            if (details.trigger.name === "level-up" && details.min_level) {
                if (playerLevel >= details.min_level) {
                    const urlParts = nextEvolutionDetails.species.url.split('/');
                    const targetId = parseInt(urlParts[urlParts.length - 2]);

                    evolutionIDTarget = targetId;
                    isEvolving = true;

                    isBattleActive = false;

                    await sleep(1000);
                    
                    const logElement = document.getElementById("log-text");
                    if (logElement) {
                        logElement.innerHTML = `what? ${playerPokemon.name.toUpperCase()} is evolving!<br>Do you want to allow it to evolve?`;
                    }
                    updateMenu("evolve");
                }
            }
        }
    }
    catch (error) {
        console.error("Error: ", error);
    }
}

function updatePlayerUI() {
    if (!playerPokemon) return;

    document.getElementById("player-name").innerText = playerPokemon.name.toUpperCase();
    document.getElementById("player-level").innerText = playerLevel;
    document.getElementById("player-sprite").src = playerPokemon.spriteBack;

    document.getElementById("player-hp-text").innerText = `${playerPokemon.hp}/${playerPokemon.maxhp}`;
    let playerHpProcent = (playerPokemon.hp / playerPokemon.maxhp) * 100;
    document.getElementById("player-hp-fill").style.width = `${playerHpProcent}%`;

    updateStatusUI();
}

function updateXPUI() {
    const xpFill = document.getElementById("player-xp-fill");

    if (xpFill) {
        let xpProcent = (playerXP / xpNeededForLevel) * 100;

        xpProcent = Math.min(100, Math.max(0, xpProcent));

        xpFill.style.width = `${xpProcent}%`;
    }
}

async function gainXP(amount) {
    const logElement = document.getElementById("log-text");
    playerXP += amount;

    if (logElement) logElement.innerHTML += `<br>${playerPokemon.name.toUpperCase()} gained ${amount} XP!`

    while (playerXP >= xpNeededForLevel) {
        playerXP -= xpNeededForLevel;
        playerLevel++;

        xpNeededForLevel = Math.floor(xpNeededForLevel * 1.2);

        playerPokemon.maxhp = Math.floor(playerPokemon.maxhp * 1.1);
        playerPokemon.attack = Math.floor(playerPokemon.attack * 1.1);
        playerPokemon.defense = Math.floor(playerPokemon.defense * 1.1);
        playerPokemon.specialAttack = Math.floor(playerPokemon.specialAttack * 1.1);
        playerPokemon.specialDefense = Math.floor(playerPokemon.specialDefense * 1.1);
        playerPokemon.speed = Math.floor(playerPokemon.speed * 1.1);

        playerPokemon.hp = playerPokemon.maxhp;

        if (logElement) logElement.innerHTML = `${playerPokemon.name.toUpperCase()} grew to level ${playerLevel}!`;
        
        await checkAndLearnNewMove(playerLevel);
    }

    checkEvolution();

    updateXPUI();
}

async function checkAndLearnNewMove(newLevel) {
    const logElement = document.getElementById("log-text");

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${playerPokemon.id}`);
    const data = await response.json();

    const newMoveData = data.moves.find(m => {
        return m.version_group_details.some(detail =>
            detail.move_learn_method.name === "level-up" &&
            detail.level_learned_at === newLevel
        );
    });

    if (newMoveData) {
        const moveResponse = await fetch(newMoveData.move.url);
        const moveData = await moveResponse.json();

        const alreadyknows = playerPokemon.moves.some(m => m.name === moveData.name);

        if (!alreadyknows) {
            const newMove = {
                name: moveData.name,
                power: moveData.power || 0,
                type: moveData.type.name,
                damageClass: moveData.damage_class.name,
                accuracy: moveData.accuracy !== null ? moveData.accuracy : 100,
                maxPP: moveData.pp !== null ? moveData.pp : 35,
                currentPP: moveData.pp !== null ? moveData.pp : 35,
                statChange: moveData.stat_changes && moveData.stat_changes.length > 0 ? {
                    stat: moveData.stat_changes[0].stat.name,
                    change: moveData.stat_changes[0].change
                } : null,
                statusEffect: moveData.meta && moveData.meta.ailment && moveData.meta.ailment.name !== "none" ? {
                    name: moveData.meta.ailment.name,
                    chance: moveData.meta.effect_chance !== null ? moveData.meta.effect_chance : (moveData.damage_class.name === "status" ? 100 : 10)
                } : null
            };

            if (playerPokemon.moves.length < 4) {
                playerPokemon.moves.push(newMove);
            } else {
                moveToLearn = newMove;
                isLearningMove = true;

                return new Promise((resolve) => {
                    if (logElement) logElement.innerHTML = `${playerPokemon.name.toUpperCase()} wants to learn the move 
                    ${newMove.name.toUpperCase()}!<br>But it already knows 4 moves. Select a move to forget:`;

                    updateMenu("learn-move");

                    window.resolveMoveLearning = resolve;
                });
            }
        }
    }
}

function togglePokedex(show) {
    const dexContainer = document.getElementById("pokedex-container");
    if (!dexContainer) return;
    if (show) {
        dexContainer.style.display = "block";
        renderPokedex();
    } else {
        dexContainer.style.display = "none";
    }
}

async function chooseStarter(starterId) {
    const logElement = document.getElementById("log-text");
    if (logElement) logElement.innerText = "Loading your partner...";

    playerPokemon = await getPokemonData(starterId);


    if (!pokedexList.includes(starterId)) {
        pokedexList.push(starterId);
    }

    const startOverlay = document.getElementById("start-menu");
    if (startOverlay)  { 
        startOverlay.style.display = "none"; 
        startOverlay.style.opacity = "0";
        startOverlay.style.pointerEvents = "none";
    }

    updatePlayerUI();

    endBattle();
}

async function startNewBattle() {
    isBattleActive = true;
    isPlayerTurn = true;
    currentMenuState = "main";

    playerStats.attack = 0;
    playerStats.defense = 0;
    playerStats.specialAttack = 0;
    playerStats.specialDefense = 0;
    playerStats.speed = 0;

    opponentStats.attack = 0;
    opponentStats.defense = 0;
    opponentStats.specialAttack = 0;
    opponentStats.specialDefense = 0;
    opponentStats.speed = 0;

    const levelOffSet = Math.floor(Math.random() * 3) - 1;
    opponentLevel = Math.max(2, playerLevel + levelOffSet);

    const randomIndex = Math.floor(Math.random() * encouterpool.length);
    const randomOpponent = encouterpool[randomIndex];

    opponentPokemon = await getPokemonData(randomOpponent);
    opponentPokemon.hp = opponentPokemon.maxhp;

    updatePlayerUI();

    document.getElementById("opponent-name").innerText = opponentPokemon.name.toUpperCase();
    document.getElementById("opponent-level").innerText = opponentLevel;
    document.getElementById("opponent-sprite").src = opponentPokemon.spriteFront;
    document.getElementById("opponent-hp-fill").style.width = "100%";

    const logElement = document.getElementById("log-text");
    if (logElement) logElement.innerHTML = `A wild ${opponentPokemon.name.toUpperCase()} appeared!<br>What will ${playerPokemon.name.toUpperCase()} do?`;

    updateMenu("main");
}

window.addEventListener("DOMContentLoaded", () => {
    pokedex();

    const startOverlay = document.getElementById("start-menu");
    if (startOverlay) startOverlay.style.display = "flex";
});

async function pokedex() {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=151`);
    const data = await response.json();

    KantoPokedex = data.results.map((pokemon, index) => {
        const id = index + 1;
        return {
            id: id,
            name: pokemon.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        }
    });
    renderPokedex();    
}

function renderPokedex() {
    const grid = document.getElementById("pokedex-grid");
    if (!grid) return;

    grid.innerHTML = "";

    KantoPokedex.forEach(pokemon => {
        const card = document.createElement("div");
        const hasCaught = pokedexList.includes(pokemon.id);
        const formattedId = String(pokemon.id).padStart(3, '0');

        if (hasCaught) {
            card.className = "pokedex-card caught";
            card.innerHTML = `
            <span class="pokedex-number">#${formattedId}</span>
            <img class="pokedex-sprite" src="${pokemon.sprite}" alt="${pokemon.name}">
            <div class="pokedex-name">${pokemon.name.toUpperCase()}</div>
            `;

            card.onclick = async () => {
                const logElement = document.getElementById("log-text");
                if (logElement) logElement.innerText = `Loading ${pokemon.name.toUpperCase()}...`;
                
                playerPokemon = await getPokemonData(pokemon.id);

                updatePlayerUI();

                if (isBattleActive) {

                    if (logElement) logElement.innerText = `Go! ${playerPokemon.name.toUpperCase()}!`;
            
                    togglePokedex(false);

                    isPlayerTurn = false;
                    updateMenu("main");

                    setTimeout(() => {
                        if (!isBattleActive) return;

                        const randomIndex = Math.floor(Math.random() * opponentPokemon.moves.length);
                        const opponentMove = opponentPokemon.moves[randomIndex];

                        if (canPokemonAttack(opponentPokemon, false)) {
                            if (checkMoveHit(opponentMove, opponentPokemon.name)) {
                                doOpponentAttack(opponentMove);
                            }
                        }

                        setTimeout(() => {
                            if (!isBattleActive || playerPokemon.hp <= 0 || opponentPokemon.hp <= 0) return;

                            const keepFighting = applyEndResultDamage();

                            if (keepFighting && isBattleActive) {
                                if (logElement) logElement.innerText = `What will ${playerPokemon.name.toUpperCase()} do?`;
                                updateMenu("main");
                                isPlayerTurn = true;
                            }
                        }, 1000);
                    }, 1000);

                } else {
                    if (logElement) logElement.innerText = `${playerPokemon.name.toUpperCase()} is ready to battle! press NEXT FIGHT to start.`
                    
                    togglePokedex(false);
                }
            }

            
        } else {
            card.className = "pokedex-card unknown";
            card.innerHTML = `
                <span class="pokedex-number">#${formattedId}</span>
                <div class="pokedex-silhuette">?</div>
                <div class="pokedex-name">???</div>
            `;
        }

        grid.appendChild(card);
    });
}

async function getPokemonData(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const data = await response.json();

    const playerLevelMoves = data.moves.filter(m => {
        return m.version_group_details.some(detail =>
            detail.move_learn_method.name === "level-up" &&
            detail.level_learned_at <= playerLevel
        );
     });
     
     const movePromises = playerLevelMoves.slice(0, 4).map(async (m) => {
        const moveResponse = await fetch(m.move.url);
        const moveData = await moveResponse.json();

        let statChange = null;
        if (moveData.stat_changes && moveData.stat_changes.length > 0) {
            statChange = {
                stat: moveData.stat_changes[0].stat.name,
                change: moveData.stat_changes[0].change
            };
        }

        let statusEffect = null;
        if (moveData.meta && moveData.meta.ailment && moveData.meta.ailment.name != "none") {
            let finalChance = moveData.meta.effect_chance;
            if (finalChance === null || finalChance === undefined) {
                finalChance = (moveData.damage_class.name === "status") ? 100 : 10;
            }

            statusEffect = {
                name: moveData.meta.ailment.name,
                chance: finalChance
            };
        }

        return {
            name: moveData.name,
            power: moveData.power || 0,
            type: moveData.type.name,
            damageClass: moveData.damage_class.name,
            accuracy: moveData.accuracy !== null ? moveData.accuracy : 100,
            maxPP: moveData.PP !== null ?  moveData.pp : 35,
            currentPP: moveData.PP !== null ? moveData.pp : 35,
            statChange: statChange,
            statusEffect: statusEffect
        };
    });

    const detailedMoves = await Promise.all(movePromises);

    return {
        id: data.id,
        name: data.name,
        hp: data.stats[0].base_stat,
        maxhp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        specialAttack: data.stats[3].base_stat,
        specialDefense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
        status: "none",
        types: data.types.map(t => t.type.name),
        spriteFront: data.sprites.front_default,
        spriteBack: data.sprites.back_default,
        moves: detailedMoves
    };
}

function calculateDamage(attacker, defender, move) {

        if (!move.power || move.power <= 0) return 0;

        const level = (attacker.name === playerPokemon.name) ? playerLevel : opponentLevel;
        const power = move.power || 40;

        const isCrit = Math.random() < (1/24);

        let finalAttack = 0;
        let finalDefense = 0;

        const attackerAttackStage = (attacker.name === playerPokemon.name) ? playerStats.attack : opponentStats.attack;
        const attackerSpAtkStage = (attacker.name === playerPokemon.name) ? playerStats.specialAttack : opponentStats.specialAttack;
        const defenderDefenseStage = (attacker.name === playerPokemon.name) ? playerStats.defense : opponentStats.defense;
        const defenderSpDefStage = (attacker.name === playerPokemon.name) ? playerStats.specialDefense : opponentStats.specialDefense;

        let attackStageToUse = move.damageClass === "special" ? attackerSpAtkStage : attackerAttackStage;
        let defenseStageToUse = move.damageClass === "special" ? defenderSpDefStage : defenderDefenseStage;

        if (isCrit) {
            if (attackStageToUse < 0) attackStageToUse = 0;
            if (defenseStageToUse > 0) defenseStageToUse = 0;
        }

        finalAttack = move.damageClass === "special" ? attacker.specialAttack : attacker.attack;
        finalDefense = move.damageClass === "special" ? defender.specialDefense : defender.defense;

        finalAttack *= getStageMultiplier(attackStageToUse);
        finalDefense *= getStageMultiplier(defenseStageToUse);

        const adratio = finalAttack / finalDefense;

        let damage = (((2 * level / 5 + 2) * power * adratio) / 50) + 2;

        if (attacker.types.includes(move.type)) {
            damage * 1.5;
        }

        let typeMultiplier = 1;

        defender.types.forEach(defType => {
            if (typeChart[move.type] && typeChart[move.type][defType] !== undefined) {
                typeMultiplier *= typeChart[move.type][defType];
            }
        });

        move.lastEffectiveness = typeMultiplier;
        damage *= typeMultiplier;

        if (isCrit) {
            damage *= 1.5;
            
            move.lastHitWasCritical = true;
        } else {
            move.lastHitWasCritical = false;
        }

        return Math.floor(damage * (Math.random() * 0.15 + 0.85));
    }

async function pokemonUpdate() {
    const logElement = document.getElementById("log-text");

    if (!playerPokemon) {
        playerPokemon = await getPokemonData(4);
        if (!pokedexList.includes(4)) pokedexList.push(4);
    }

    const levelOffSet = Math.floor(Math.random() * 3) - 1;
    opponentLevel = Math.max(2, playerLevel + levelOffSet);

    const randomIndex = Math.floor(Math.random() * encouterpool.length);
    const randomOpponent = encouterpool[randomIndex];

    opponentPokemon = await getPokemonData(randomOpponent);

    playerPokemon.hp = playerPokemon.maxhp;
    playerStats.attack = 0;
    playerStats.defense = 0;
    playerStats.specialAttack = 0;
    playerStats.specialDefense = 0;
    playerStats.speed = 0;
    playerPokemon.status = "none";

    updatePlayerUI();

    document.getElementById("opponent-name").innerText = opponentPokemon.name.toUpperCase();
    document.getElementById("opponent-level").innerText = opponentLevel;
    document.getElementById("opponent-sprite").src = opponentPokemon.spriteFront
    document.getElementById("opponent-hp-fill").style.width = "100%";

    opponentStats.attack = 0;
    opponentStats.defense = 0;
    opponentStats.specialAttack = 0;
    opponentStats.specialDefense = 0;
    opponentStats.speed = 0;

    opponentPokemon.status = "none";

    isBattleActive = true;
    isPlayerTurn = true;
    
    updateStatusUI();
    updateXPUI();
    updateMenu("main");
    
    if (logElement) logElement.innerHTML = `${opponentPokemon.name.toUpperCase()} attacks!<br> What will 
        ${playerPokemon.name.toUpperCase()} do?`;
}

function updateStatusUI() {
    const playerStatusEl = document.getElementById("player-status");
    const opponentStatusEl = document.getElementById("opponent-status");

    if (playerStatusEl) {
        if (playerPokemon && playerPokemon.status && playerPokemon.status !== "none" && playerPokemon.status !== "") {
            playerStatusEl.innerText = `[${playerPokemon.status.substring(0, 3).toUpperCase()}]`
            playerStatusEl.className = `status-badge ${playerPokemon.status}`;
        } else {
            playerStatusEl.innerText = "";
        }
    }

    if (opponentStatusEl) {
        if (opponentPokemon && opponentPokemon.status && opponentPokemon.status !== "none" && opponentPokemon.status !== "") {
            opponentStatusEl.innerText = `[${opponentPokemon.status.substring(0, 3).toUpperCase()}]`;
            opponentStatusEl.className = `status-badge ${opponentPokemon.status}`;
        } else {
            opponentStatusEl.innerText = "";
        }
    }
}

function getStageMultiplier(stage) {
    if (stage === 0) return 1;
    if (stage > 0) return (2 + stage) / 2;
    return 2 / (2 - stage); 
}

function tryApplyStatus(move, targetPokemon) {
    if (!move.statusEffect) return "";
    if (targetPokemon.status !== "none") return "";

    const roll = Math.random() * 100;
    if (roll <= move.statusEffect.chance) {
        targetPokemon.status = move.statusEffect.name;

        updateStatusUI();

        if (targetPokemon.status === "sleep") {
            targetPokemon.sleepTurns = Math.floor(Math.random() * 3) + 1
            return `<br>${targetPokemon.name.toUpperCase()} fell asleep!`;
        }
        if (targetPokemon.status === "poison") {
            return `<br>${targetPokemon.name.toUpperCase()} was poisoned!`;
        }
        if (targetPokemon.status === "burn") {
            return `<br>${targetPokemon.name.toUpperCase()} was burned`;
        }
        if (targetPokemon.status === "paralysis") {
            return `<br>${targetPokemon.name.toUpperCase()} was paralyzed`;
        }
        if (targetPokemon.status === "freeze") {
            return `<br>${targetPokemon.name.toUpperCase()} was frozen solid`;
        }
    }
    return "";
}

function handleMenuClick(buttonNumber) {
    const logElement = document.getElementById("log-text");

    if (isEvolving && currentMenuState === "evolve") {
        if (buttonNumber === 1) {
            executeEvolution();
        }
        return;
    }

    if (isLearningMove && currentMenuState === "learn-move") {
        const moveIndex = buttonNumber - 1;
        if (playerPokemon.moves[moveIndex]) {
            const forgottenMoveName = playerPokemon.moves[moveIndex].name.toUpperCase();

            playerPokemon.moves[moveIndex] = moveToLearn;

            if (logElement) {
                logElement.innerHTML = `1, 2 and... poof!<br>${playerPokemon.name.toUpperCase()} 
                forgot ${forgottenMoveName} and learned ${moveToLearn.name.toUpperCase()}!`
            }
        }

        isLearningMove = false;
        moveToLearn = null;

        if (window.resolveMoveLearning) {
            window.resolveMoveLearning();
        }

        setTimeout(() => {
            endBattle();
        }, 1000);
        return;
    }

    if (!isBattleActive) {
        if (buttonNumber === 1) startNewBattle();
        else if (buttonNumber === 2) togglePokedex(true);
        else if (buttonNumber === 5) handleBackClick();

        return;
    }

    if (!isPlayerTurn) {
        return;
    }

    if (currentMenuState === "main") {
        if (buttonNumber === 1) updateMenu("fight");
        else if (buttonNumber === 2) {}
        else if (buttonNumber === 3) togglePokedex(true);
        else if (buttonNumber === 4) if(logElement) logElement.innerText = "You cannot run from this battle!";
    }

    else if (currentMenuState === "fight") {
        const chosenMove = playerPokemon.moves[buttonNumber - 1];
        if (chosenMove) {
            if (chosenMove.currentPP <= 0) {
                if (logElement) logElement.innerText = `Theres no PP left for this move!`;
                return;
            }
            executeTurn(chosenMove);
        }
    }
}

function updateMenu(state) {
    currentMenuState = state

    const button1 = document.getElementById("button-1");
    const button2 = document.getElementById("button-2");
    const button3 = document.getElementById("button-3");
    const button4 = document.getElementById("button-4");
    const backButton = document.getElementById("button-back");

    if (state === "main") {
        button1.innerText = "FIGHT";
        button2.innerText = "BAG";
        button3.innerText = "POKEMON";
        button4.innerText = "RUN";
        if (backButton) backButton.style.display = "none";
    }

    else if (state === "fight" || "learn-move") {

        const moves = playerPokemon.moves;

        button1.innerText = playerPokemon.moves[0] ? `${playerPokemon.moves[0].name.toUpperCase()}\nPP: ${moves[0].currentPP}/${moves[0].maxPP}` : "-";
        button2.innerText = playerPokemon.moves[1] ? `${playerPokemon.moves[1].name.toUpperCase()}\nPP: ${moves[1].currentPP}/${moves[1].maxPP}` : "-";
        button3.innerText = playerPokemon.moves[2] ? `${playerPokemon.moves[2].name.toUpperCase()}\nPP: ${moves[2].currentPP}/${moves[2].maxPP}` : "-";
        button4.innerText = playerPokemon.moves[3] ? `${playerPokemon.moves[3].name.toUpperCase()}\nPP: ${moves[3].currentPP}/${moves[3].maxPP}` : "-";
        if (backButton) {
            backButton.style.display = "inline-block"; 
            backButton.innerText = state === "fight" ? "BACK" : "DONT LEARN";
        }
    }

    else if (state === "evolve") {
        button1.innerText = "YES";
        button2.innerText = "-";
        button3.innerText = "-";
        button4.innerText = "-";
        if (backButton) {
            backButton.innerText = "NO";
            backButton.style.display = "inline-block";
        }
    }
}

function handleBackClick() {
    const logElement = document.getElementById("log-text");

    if (currentMenuState === "fight") {
        updateMenu("main")
        if (logElement) logElement.innerHTML = `What will ${playerPokemon.name.toUpperCase()} do?`;
    } 
    else if (currentMenuState === "learn-move" && isLearningMove) {
        if (logElement) logElement.innerHTML = `What will ${playerPokemon.name.toUpperCase()} do?`;

        isLearningMove = false;
        moveToLearn = null;

        if(window.resolveMoveLearning) {
            resolveMoveLearning();
        }
        
        updateMenu("main");
    }
    else if (currentMenuState === "evolve" && isEvolving) {
        if (logElement) logElement.innerHTML = `What will ${playerPokemon.name.toUpperCase()} do?`;

        isEvolving = false;
        evolutionIDTarget = null;
        evolutionTargetName = "";

        updateMenu("main");
    }
}

async function executeTurn(playerMove) {

    isPlayerTurn = false;

    const logElement = document.getElementById("log-text");

    playerMove.currentPP = Math.max(0, playerMove.currentPP - 1);

    updateMenu("fight");

    const playerSpeed = playerPokemon.speed * getStageMultiplier(playerStats.speed);
    const opponentSpeed = opponentPokemon.speed * getStageMultiplier(opponentStats.speed);

    const randomIndex = Math.floor(Math.random() * opponentPokemon.moves.length);
    const opponentMove = opponentPokemon.moves[randomIndex];

    if (playerSpeed >= opponentSpeed) {
        if (canPokemonAttack(playerPokemon, true)) {
            if (checkMoveHit(playerMove, playerPokemon.name)) {
                doPlayerAttack(playerMove);
            }
        }

        await sleep(1000);
        
        if (opponentPokemon.hp > 0) {
            if (canPokemonAttack(opponentPokemon, false)) {
                if (checkMoveHit(opponentMove, opponentPokemon.name)) {
                    doOpponentAttack(opponentMove);
                }
            }
        }

        await sleep(1000);
        if (playerPokemon.hp > 0) {
            const keepFighting = await applyEndResultDamage();
            if (keepFighting) {
                if (logElement) logElement.innerText = `What will ${playerPokemon.name.toUpperCase()} do?`;
                updateMenu("main");
                isPlayerTurn = true;
            }
        }
            
    } else {
        if (canPokemonAttack(opponentPokemon, false)) {
            if (checkMoveHit(opponentMove, opponentPokemon.name)) {
                doOpponentAttack(opponentMove);
            }
        }

        await sleep(1000);
        if (playerPokemon.hp > 0) {
            if (canPokemonAttack(playerPokemon, true)) {
                if (checkMoveHit(playerMove, playerPokemon.name)) {
                    doPlayerAttack(playerMove);
                }
            }

            await sleep(1000);
        }
    }    

    if (isBattleActive) {
        if (playerPokemon.hp <= 0) {
            if (logElement) logElement.innerHTML = `${playerPokemon.name.toUpperCase()} fainted...`;
            await sleep(1000);
            endBattle();
            return;
        }
        if (opponentPokemon.hp <= 0) {
            if (logElement) logElement.innerHTML = `Foe ${opponentPokemon.name.toUpperCase()} fainted!`;
            await sleep(1000);

            if (!pokedexList.includes(opponentPokemon.id)) pokedexList.push(opponentPokemon.id);
            const xpGained = opponentLevel * 25;
            await gainXP(xpGained);

            if (!isEvolving && !isLearningMove) endBattle();
            return;
        }

        const keepFighting = await applyEndResultDamage();
        if (keepFighting && isBattleActive && !isLearningMove && !isEvolving) {
            if (logElement) logElement.innerText = `What will ${playerPokemon.name.toUpperCase()} do?`;
            updateMenu("main");
            isPlayerTurn = true;
        }
    }
}

async function executeEvolution() {
    const logElement = document.getElementById("log-text");
    if (logElement) logElement.innerHTML = `Congratulations! Your ${playerPokemon.name.toUpperCase()} evolved!`;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionIDTarget}`);
    const data = await response.json();

    const currentMoves = playerPokemon.moves;

    playerPokemon.id = data.id;
    playerPokemon.name = data.name;
    playerPokemon.spriteFront = data.sprites.front_default;
    playerPokemon.spriteBack = data.sprites.back_default;
    playerPokemon.types = data.types.map(t => t.type.name);

    playerPokemon.maxhp = data.stats[0].base_stat;
    playerPokemon.attack = data.stats[1].base_stat;
    playerPokemon.defense = data.stats[2].base_stat;
    playerPokemon.specialAttack = data.stats[3].base_stat;
    playerPokemon.specialDefense = data.stats[4].base_stat;
    playerPokemon.speed = data.stats[5].base_stat

    for (let i = 5; i < playerLevel; i++) {
        playerPokemon.maxhp = Math.floor(playerPokemon.maxhp * 1.1);
        playerPokemon.attack = Math.floor(playerPokemon.attack * 1.1);
        playerPokemon.defense = Math.floor(playerPokemon.defense * 1.1);
        playerPokemon.specialAttack = Math.floor(playerPokemon.specialAttack * 1.1);
        playerPokemon.specialDefense = Math.floor(playerPokemon.specialDefense * 1.1);
        playerPokemon.speed = Math.floor(playerPokemon.speed * 1.1);
    }

    playerPokemon.hp = playerPokemon.maxhp;
    playerPokemon.moves = currentMoves;

    const evolutionMoves = checkNewMovesForLevels(data, playerLevel);

    for (const newMove of evolutionMoves) {
        const alreadyknows = playerPokemon.moves.some(m => m.name === newMove.name);

        if (!alreadyknows) {
            const moveResponse = await fetch(newMove.url);
            const moveData = await moveResponse.json();

            const formattedMove = {
                name: moveData.name,
                power: moveData.power,
                accuracy: moveData.accuracy || 100,
                maxPP: moveData.pp !== null ? moveData.pp : 35,
                currentPP: moveData.pp !== null ? moveData.pp : 35,
                damageClass: moveData.damage_class.name,
                statChange: moveData.stat_changes && moveData.stat_changes.length > 0 ? {
                    change: moveData.stat_changes[0].change,
                    stat: moveData.stat_changes[0].stat.name
                } : null
            };

            if (playerPokemon.moves.length < 4) {
                playerPokemon.moves.push(formattedMove);
            } else {
                if (logElement) logElement.innerHTML += `${playerPokemon.name.toUpperCase()} wants to learn the move ${formattedMove.name.toUpperCase()}, but already knows 4 moves!`;
                
                updateMenu("learn-move");
            }
        }
    }

    if (!pokedexList.includes(playerPokemon.id)) {
        pokedexList.push(playerPokemon.id);
    }

    updatePlayerUI();

    isEvolving = false;
    evolutionIDTarget = null;

    return true;
}

function doPlayerAttack(playerMove) {
    const logElement = document.getElementById("log-text");
    let statusText = "";

    if (playerMove.damageClass === "status") {
        let statText = "";

        if (playerMove.statChange) {
            const change = playerMove.statChange.change;
            const statName = playerMove.statChange.stat.toUpperCase();

            if (change < 0) {
                if (playerMove.statChange.stat === "attack") opponentStats.attack = Math.max(-6, opponentStats.attack + change);
                if (playerMove.statChange.stat === "defense") opponentStats.defense = Math.max(-6, opponentStats.defense + change);
                if (playerMove.statChange.stat === "speed") opponentStats.speed = Math.max(-6, opponentStats.speed + change);
                statText = `<br>Foe ${opponentPokemon.name.toUpperCase()}'s ${statName} fell!`
            }
        }

        statusText = tryApplyStatus(playerMove, opponentPokemon);

        if (logElement) {
            logElement.innerHTML = `${playerPokemon.name.toUpperCase()} used ${playerMove.name.toUpperCase()}!${statText}`;
        }
    } else {
        let damageToOpponent = calculateDamage(playerPokemon, opponentPokemon, playerMove);
        opponentPokemon.hp = Math.max(0, opponentPokemon.hp - damageToOpponent);

        let opponentHpProcent = (opponentPokemon.hp / opponentPokemon.maxhp) * 100;
        document.getElementById("opponent-hp-fill").style.width = `${opponentHpProcent}%`;

        if (opponentPokemon.hp > 0) statusText = tryApplyStatus(playerMove, opponentPokemon);

        let effectivenessText = "";
        if (playerMove.lastEffectiveness > 1) effectivenessText = `<br>It's super effective!`;
        if (playerMove.lastEffectiveness < 1) effectivenessText = `<br>It's not very effective...`;
        if (playerMove.lastEffectiveness === 0) effectivenessText = `<br>It has no effect...`;

        let critText = playerMove.lastHitWasCritical ? `<br>A critical hit!` : "";
        if (logElement) logElement.innerHTML = `${playerPokemon.name.toUpperCase()} used ${playerMove.name.toUpperCase()}!${critText}${effectivenessText}`
    }
}

function doOpponentAttack(opponentMove) {
    const logElement = document.getElementById("log-text");
    let statusText = "";

    if (opponentMove.damageClass === "status") {
        let oppStatText = "";
        if (opponentMove.statChange) {
            const change = opponentMove.statChange.change;
            const statName = opponentMove.statChange.stat.toUpperCase();

            if (change < 0) {
                if (opponentMove.statChange.stat === "attack") playerStats.attack = Math.max(-6, playerStats.attack + change);
                if (opponentMove.statChange.stat === "defense") playerStats.defense = Math.max(-6, playerStats.defense + change);
                if (opponentMove.statChange.stat === "speed") playerStats.speed = Math.max(-6, playerStats.speed + change);
                oppStatText = `<br>${playerPokemon.name.toUpperCase()}'s ${statName} fell!`;
            }
        }

        statusText = tryApplyStatus(opponentMove, playerPokemon);

        if (logElement) {
            logElement.innerHTML = `Foe ${opponentPokemon.name.toUpperCase()} used ${opponentMove.name.toUpperCase()}!${oppStatText}`;
        }
    } else {

        let damageToPlayer = calculateDamage(opponentPokemon, playerPokemon, opponentMove);
        playerPokemon.hp = Math.max(0, playerPokemon.hp - damageToPlayer);

        document.getElementById("player-hp-text").innerHTML = `${playerPokemon.hp}/${playerPokemon.maxhp}`;
        let playerHpProcent = (playerPokemon.hp / playerPokemon.maxhp) * 100;
        document.getElementById("player-hp-fill").style.width = `${playerHpProcent}%`;

        if (opponentPokemon.hp > 0) {
            statusText = tryApplyStatus(opponentMove, playerPokemon)
        }

        let opponentEffectivenessText = "";
        if (opponentMove.lastEffectiveness > 1) opponentEffectivenessText = `<br>It's super effective!`;
        if (opponentMove.lastEffectiveness < 1) opponentEffectivenessText = `<br>It's not very effective...`;
        if (opponentMove.lastEffectiveness === 0) opponentEffectivenessText = `<br>It has no effect...`;

        let critText = opponentMove.lastHitWasCritical ? `<br>A critical hit!` : "";
        if (logElement) logElement.innerHTML = `Foe ${opponentPokemon.name.toUpperCase()} used ${opponentMove.name.toUpperCase()}!${critText}${opponentEffectivenessText}${statusText}`;
    }
}

function checkMoveHit(move, attackerName) {
    const logElement = document.getElementById("log-text");
    const roll = Math.random() * 100;

    if (roll > move.accuracy) {
        if (logElement) {
            logElement.innerHTML += `<br>${attackerName.toUpperCase()}'s attack missed!`;
        }
        return false;
    }
    return true;
}

function canPokemonAttack(pokemon, isPlayer) {
    const logElement = document.getElementById("log-text");

    if (pokemon.status === "sleep") {
        pokemon.sleepTurns--;
        if (pokemon.sleepTurns <= 0) {
            pokemon.status = "none";
            if (logElement) logElement.innerHTML += `<br>${pokemon.name.toUpperCase()} woke up!`;
            return true;
        }
        if (logElement) logElement.innerHTML = `${pokemon.name.toUpperCase()} is fast asleep...`;
        return false;
    }

    if (pokemon.status === "paralysis") {
        if (Math.random() < 0.25) {
            if (logElement) logElement.innerHTML = `${pokemon.name.toUpperCase()} is paralyzed, so it can't move!`;
            return false;
        }
    }

    if (pokemon.status === "freeze") {
        if (Math.random() < 0.20) {
            pokemon.status = "none";
            updateStatusUI();
            if (logElement) logElement.innerHTML = `${pokemon.name.toUpperCase()} thawed out!`;
            return true;
        }
        if (logElement) logElement.innerHTML = `${pokemon.name.toUpperCase()} is frozen solid!`;
        return false;
    }

    if (pokemon.isConfused) {
        pokemon.confusionTurns--;
        if (pokemon.confusionTurns <= 0) {
            pokemon.isConfused = false;
            if (logElement) logElement.innerHTML += `<br>${pokemon.name.toUpperCase()} snapped out of confusion!`;
        } else {
            if (logElement) logElement.innerHTML = `${pokemon.name.toUpperCase()} is confused...`;

            if (Math.random() < 0.33) {
                const selfDamage = Math.floor(pokemon.maxhp * 0.1);
                pokemon.hp = Math.max(0, pokemon.hp - selfDamage);

                if (isPlayer) {
                    document.getElementById("player-hp-text").innerHTML = `${pokemon.hp}/${pokemon.maxhp}`;
                    document.getElementById("player-hp-fill").style.width = `${(pokemon.hp / pokemon.maxhp) * 100}%`;
                } else {
                    document.getElementById("opponent-hp-fill").style.width = `${(pokemon.hp / pokemon.maxhp) * 100}%`;
                }

                if (logElement) logElement.innerHTML += `<br>It hurt itself in its confusion!`;

                if (pokemon.hp <= 0) {
                    setTimeout(() => {
                        if (logElement) logElement.innerText = `${pokemon.name.toUpperCase()} fainted!`;
                        endBattle();
                    }, 1000);
                }
                return false;
            }
        }
    }

    return true;
}

async function applyEndResultDamage() {
    const logElement = document.getElementById("log-text");
    let extraLog = "";

    if (playerPokemon.status === "burn" || playerPokemon.status === "poison") {
        const dotDamage = Math.floor(playerPokemon.maxhp / 16) || 1;
        playerPokemon.hp = Math.max(0, playerPokemon.hp - dotDamage);

        document.getElementById("player-hp-text").innerHTML = `${playerPokemon.hp}/${playerPokemon.maxhp}`;
        document.getElementById("player-hp-fill").style.width = `${(playerPokemon.hp / playerPokemon.maxhp) * 100}%`
        extraLog += `<br>${playerPokemon.name.toUpperCase()} was hurt from its ${playerPokemon.status}!`;
    }

    if (opponentPokemon.status === "burn" || opponentPokemon.status === "poison") {
        const dotDamage = Math.floor(opponentPokemon.maxhp / 16) || 1;
        opponentPokemon.hp = Math.max(0, opponentPokemon.hp - dotDamage);
        document.getElementById("opponent-hp-fill").style.width = `${(opponentPokemon.hp / opponentPokemon.maxhp) * 100}%`;
        extraLog += `<br>Foe ${opponentPokemon.name.toUpperCase()} was hurt from its ${opponentPokemon.status}!`;
    }

    if (extraLog !== "" && logElement) {
        logElement.innerHTML += extraLog;
        await sleep (1000);
    }

    if (playerPokemon.hp <= 0 || opponentPokemon.hp <= 0) {
        return false;
    }
    return true;
}

function endBattle() {
    isBattleActive = false;
    isPlayerTurn = true;
    currentMenuState = "start";
    if (playerPokemon) playerPokemon.status = "none";

    const logElement = document.getElementById("log-text");
    if (logElement) logElement.innerText = "Battle over! you can click on OPEN POKEDEX to swap your Pokemon"

    document.getElementById("button-1").innerText = "NEXT FIGHT";
    document.getElementById("button-2").innerText = "OPEN POKEDEX";
    document.getElementById("button-3").innerText = "-";
    document.getElementById("button-4").innerText = "-";
    const backButton = document.getElementById("button-back");
    if (backButton) backButton.style.display = "none";
}