let pokedexList = [];

let KantoPokedex = [];

let playerPokemon = null;
let opponentPokemon = null;

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

                    setTimeout(() => {
                        const logElement = document.getElementById("log-text");
                        if (logElement) {
                            logElement.innerHTML = `what? ${playerPokemon.name.toUpperCase()} is evolving!<br>Do you want to allow it to evolve?`;
                        }
                        updateMenu("evolve");
                    }, 2000);
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

    if (isBattleActive) {
        updateMenu("main");
    }
}

function updateXPUI() {
    const xpFill = document.getElementById("player-xp-fill");

    if (xpFill) {
        let xpProcent = (playerXP / xpNeededForLevel) * 100;

        xpProcent = Math.min(100, Math.max(0, xpProcent));

        xpFill.style.width = `${xpProcent}%`;
    }
}

function gainXP(amount) {
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

        checkAndLearnNewMove(playerLevel);
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

                setTimeout(() => {
                    if (logElement) logElement.innerHTML = `${playerPokemon.name.toUpperCase()} wants to learn the move 
                    ${newMove.name.toUpperCase()}!<br>But it already knows 4 moves. Select a move to forget:`;

                    updateMenu("learn-move");
                }, 1000);
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
    playerPokemon = await getPokemonData(starterId);

    if (!pokedexList.includes(starterId)) {
        pokedexList.push(starterId);
    }

    await pokedex();
}

window.addEventListener("DOMContentLoaded", () => {
    chooseStarter(4);
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
                    setTimeout(() => {
                        doOpponentAttack();
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

        let finalAttack = 0;
        let finalDefense = 0;

        if (move.damageClass === "special") {

            const attackerSpecialAttack = (attacker.name === playerPokemon.name)
                ? attacker.specialAttack * getStageMultiplier(playerStats.specialAttack)
                : attacker.specialAttack * getStageMultiplier(opponentStats.specialAttack);

            const defenderSpecialDefense = (defender.name === playerPokemon.name)
                ? defender.specialDefense * getStageMultiplier(playerStats.specialDefense)
                : defender.specialDefense * getStageMultiplier(opponentStats.specialDefense);

                finalAttack = attackerSpecialAttack;
                finalDefense = defenderSpecialDefense;
        } else {

            const attackerAttack = (attacker.name === playerPokemon.name)
                ? attacker.attack * getStageMultiplier(playerStats.attack)
                : attacker.attack * getStageMultiplier(opponentStats.attack);

            const defenderDefense = (defender.name === playerPokemon.name)
                ? defender.defense * getStageMultiplier(playerStats.defense)
                : defender.defense * getStageMultiplier(opponentStats.defense);

                finalAttack = attackerAttack;
                finalDefense = defenderDefense;
        }
        const adratio = finalAttack / finalDefense;

        let damage = (((2 * level / 5 + 2) * power * adratio) / 50) + 2;

        const stab = attacker.types.includes(move.type) ? 1.5 : 1;

        let typeMultiplier = 1;
        const moveType = move.type.toLowerCase();

        defender.types.forEach(defenderType => {
            const defType = defenderType.toLowerCase();

            if (typeChart[moveType] && typeChart[moveType][defType] !== undefined) {
                typeMultiplier *= typeChart[moveType][defType];
            }
        });


        const randomFactor = Math.random() * (1.0 - 0.85) + 0.85;

        move.lastEffectiveness = typeMultiplier;

        return Math.floor(damage * stab * typeMultiplier * randomFactor)
    }

async function pokemonUpdate() {
    const logElement = document.getElementById("log-text");

    if (!playerPokemon) {
        playerPokemon = await getPokemonData(4);
        if (!pokedexList.includes(4)) pokedexList.push(4);
    }

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
        if (playerPokemon.status !== "none") {
            playerStatusEl.innerText = `[${playerPokemon.status.substring(0, 3).toUpperCase()}]`
            playerStatusEl.className = `status-badge ${playerPokemon.status}`;
        } else {
            playerStatusEl.innerText = "";
        }
    }

    if (opponentStatusEl) {
        if (opponentPokemon.status !== "none") {
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

        setTimeout(() => {
            endBattle();
        }, 1000);
        return;
    }

    if (!isBattleActive) {
        if (buttonNumber === 1) pokemonUpdate();
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
        updatePlayerUI();
    }

    else if (state === "fight") {
        button1.innerText = playerPokemon.moves[0] ? playerPokemon.moves[0].name.toUpperCase() : "-";
        button2.innerText = playerPokemon.moves[1] ? playerPokemon.moves[1].name.toUpperCase() : "-";
        button3.innerText = playerPokemon.moves[2] ? playerPokemon.moves[2].name.toUpperCase() : "-";
        button4.innerText = playerPokemon.moves[3] ? playerPokemon.moves[3].name.toUpperCase() : "-";
        if (backButton) {
            backButton.style.display = "inline-block"; 
            backButton.innerText = "BACK";
        }
    }

    else if (state === "learn-move") {
        button1.innerText = playerPokemon.moves[0] ? playerPokemon.moves[0].name.toUpperCase() : "-";
        button2.innerText = playerPokemon.moves[1] ? playerPokemon.moves[1].name.toUpperCase() : "-";
        button3.innerText = playerPokemon.moves[2] ? playerPokemon.moves[2].name.toUpperCase() : "-";
        button4.innerText = playerPokemon.moves[3] ? playerPokemon.moves[3].name.toUpperCase() : "-";
        if (backButton) {
            backButton.innerText = "DONT LEARN";
            backButton.style.display = "inline-block";
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

function executeTurn(playerMove) {

    isPlayerTurn = false;

    const logElement = document.getElementById("log-text");

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

        setTimeout(() => {
            if (opponentPokemon.hp > 0) {
                if (canPokemonAttack(opponentPokemon, false)) {
                    if (checkMoveHit(opponentMove, opponentPokemon.name)) {
                        doOpponentAttack(opponentMove);
                    }
                }

                setTimeout(() => {
                    if (playerPokemon.hp > 0) {
                        const keepFighting = applyEndResultDamage();
                        if (keepFighting) {
                            if (logElement) logElement.innerText = `What will ${playerPokemon.name.toUpperCase()} do?`;
                            updateMenu("main");
                            isPlayerTurn = true;
                        }
                    }
                }, 1000);
            }
        }, 1000);
    } else {
        if (canPokemonAttack(opponentPokemon, false)) {
            if (checkMoveHit(opponentMove, opponentPokemon.name)) {
                doOpponentAttack(opponentMove);
            }
        }

        setTimeout(() => {
            if (playerPokemon.hp > 0) {
                if (canPokemonAttack(playerPokemon, true)) {
                    if (checkMoveHit(playerMove, playerPokemon.name)) {
                        doPlayerAttack(playerMove);
                    }
                }

                setTimeout(() => {
                    if (opponentPokemon.hp > 0) {
                        const keepFighting = applyEndResultDamage();
                        if (keepFighting) {
                            if (logElement) logElement.innerText = `what will ${playerPokemon.name.toUpperCase()} do?`;
                            updateMenu("main");
                            isPlayerTurn = true;
                        }
                    }
                }, 1000);
            }
        }, 1000);
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

    if (!pokedexList.includes(playerPokemon.id)) {
        pokedexList.push(playerPokemon.id);
    }

    updatePlayerUI();

    isEvolving = false;
    evolutionIDTarget = null;
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

        if (opponentPokemon.hp > 0) {
            statusText = tryApplyStatus(playerMove, opponentPokemon);
        }

        let effectivenessText = "";
        if (playerMove.lastEffectiveness > 1) effectivenessText = `<br>It's super effective!`;
        if (playerMove.lastEffectiveness < 1) effectivenessText = `<br>It's not very effective...`;
        if (playerMove.lastEffectiveness === 0) effectivenessText = `<br>It has no effect...`;

        if (logElement) logElement.innerHTML = `${playerPokemon.name.toUpperCase()} used ${playerMove.name.toUpperCase()}!${effectivenessText}`
    }

    if (opponentPokemon.hp <= 0) {
        if (!pokedexList.includes(opponentPokemon.id)) {
            pokedexList.push(opponentPokemon.id);
        }

        const xpGained = opponentLevel * 25;
        gainXP(xpGained);

        setTimeout(() => {
            logElement.innerText = `Foe ${opponentPokemon.name.toUpperCase()} fainted!`;
            endBattle();
        }, 1000);
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


        if (logElement) logElement.innerHTML = `Foe ${opponentPokemon.name.toUpperCase()} used ${opponentMove.name.toUpperCase()}!${opponentEffectivenessText}`;
    }
    if (playerPokemon.hp <= 0) {
        setTimeout(() => {
            logElement.innerHTML = `${playerPokemon.name.toUpperCase()} fainted...`;
            endBattle();
        }, 1000);
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

function applyEndResultDamage() {
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
    }

    if (playerPokemon.hp <= 0 || opponentPokemon.hp <= 0) {
        setTimeout(() => {
            if (playerPokemon.hp <= 0 && logElement) logElement.innerHTML = `${playerPokemon.name.toUpperCase()} fainted...`;
            if (opponentPokemon.hp <= 0 && logElement) {
                if (!pokedexList.includes(opponentPokemon.id)) {
                    pokedexList.push(opponentPokemon.id);
                }

                const xpGained = opponentLevel * 25;
                gainXP(xpGained);

                logElement.innerHTML = `${opponentPokemon.name.toUpperCase()} fainted!`;
            } 

            endBattle();
        }, 1000);
        return false;
    }
    return true;
}

function endBattle() {
    isBattleActive = false;
    isPlayerTurn = true;
    currentMenuState = "start";

    const logElement = document.getElementById("log-text");
    if (logElement) logElement.innerText = "Battle over! you can click on OPEN POKEDEX to swap your Pokemon"

    const button1 = document.getElementById("button-1");
    button1.innerText = "NEXT FIGHT";

    const button2 = document.getElementById("button-2");
    button2.innerText = "OPEN POKEDEX";

    document.getElementById("button-3").innerText = "-";
    document.getElementById("button-4").innerText = "-";

}