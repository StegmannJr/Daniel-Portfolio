let playerPokemon = null;
let opponentPokemon = null;
let currentMenuState = "start";
let isBattleActive = false;
let isPlayerTurn = true;
let encouterpool = [16, 19, 10, 13, 21, 29, 32];

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

async function getPokemonData(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const data = await response.json();

    const level5Moves = data.moves.filter(m => {
        return m.version_group_details.some(detail =>
            detail.move_learn_method.name === "level-up" &&
            detail.level_learned_at <= 5
        );
     });
     
     const movePromises = level5Moves.slice(0, 4).map(async (m) => {
        const moveResponse = await fetch(m.move.url);
        const moveData = await moveResponse.json();
        return {
            name: moveData.name,
            power: moveData.power || 0,
            type: moveData.type.name
        };
    });

    const detailedMoves = await Promise.all(movePromises);

    return {
        name: data.name,
        hp: data.stats[0].base_stat,
        maxhp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        types: data.types.map(t => t.type.name),
        spriteFront: data.sprites.front_default,
        spriteBack: data.sprites.back_default,
        moves: detailedMoves
    };
}

function calculateDamage(attacker, defender, move) {

        if (move.power === 0) return 0;

        const level = 5;
        const power = move.power || 40;
        const adratio = attacker.attack / defender.defense;

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
    playerPokemon = await getPokemonData(4);

    const randomIndex = Math.floor(Math.random() * encouterpool.length);
    const randomOpponent = encouterpool[randomIndex];

    opponentPokemon = await getPokemonData(randomOpponent);

    document.getElementById("player-name").innerText = playerPokemon.name.toUpperCase();
    document.getElementById("player-sprite").src = playerPokemon.spriteBack,
    document.getElementById("player-hp-text").innerText = `${playerPokemon.hp}/${playerPokemon.maxhp}`;
    document.getElementById("player-hp-fill").style.width = "100%";

    document.getElementById("opponent-name").innerText = opponentPokemon.name.toUpperCase();
    document.getElementById("opponent-sprite").src = opponentPokemon.spriteFront
    document.getElementById("opponent-hp-fill").style.width = "100%";

    isBattleActive = true;
    isPlayerTurn = true;
    updateMenu("main");
    if (logElement) logElement.innerHTML = `${opponentPokemon.name.toUpperCase()} attacks!<br> What will 
        ${playerPokemon.name.toUpperCase()} do?`;
}

function handleMenuClick(buttonNumber) {
    const logElement = document.getElementById("log-text");

    if (!isBattleActive) {
        if (buttonNumber === 1) pokemonUpdate();
        return;
    }

    if (!isPlayerTurn) {
        return;
    }

    if (currentMenuState === "main") {
        if (buttonNumber === 1) {
            updateMenu("fight");
        }
        else if (buttonNumber === 2) {
        }
        else if (buttonNumber === 3) {
        }
        else if (buttonNumber === 4) {
            if(logElement) logElement.innerText = "You cannot run from this battle!";
        }
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

    if (state === "main") {
        button1.innerText = "FIGHT";
        button2.innerText = "BAG";
        button3.innerText = "POKEMON";
        button4.innerText = "RUN";
    }

    else if (state === "fight") {
        button1.innerText = playerPokemon.moves[0] ? playerPokemon.moves[0].name.toUpperCase() : "-";
        button2.innerText = playerPokemon.moves[1] ? playerPokemon.moves[1].name.toUpperCase() : "-";
        button3.innerText = playerPokemon.moves[2] ? playerPokemon.moves[2].name.toUpperCase() : "-";
        button4.innerText = playerPokemon.moves[3] ? playerPokemon.moves[3].name.toUpperCase() : "-";
    }
}

function executeTurn(playerMove) {

    isPlayerTurn = false;

    const logElement = document.getElementById("log-text");

    let damageToOpponent = calculateDamage(playerPokemon, opponentPokemon, playerMove);
    opponentPokemon.hp = Math.max(0, opponentPokemon.hp - damageToOpponent);

    let opponentHpProcent = (opponentPokemon.hp / opponentPokemon.maxhp) * 100;
    document.getElementById("opponent-hp-fill").style.width = `${opponentHpProcent}%`;

    let effectivenessText = "";
    if (playerMove.lastEffectiveness > 1) effectivenessText = `<br>It's super effective!`;
    if (playerMove.lastEffectiveness < 1) effectivenessText = `<br>It's not very effective...`;
    if (playerMove.lastEffectiveness === 0) effectivenessText = `<br>It has no effect...`;

    logElement.innerHTML = `${playerPokemon.name.toUpperCase()} used ${playerMove.name.toUpperCase()}!${effectivenessText}`

    if (opponentPokemon.hp <= 0) {
        setTimeout(() => {
            logElement.innerText = `Foe ${opponentPokemon.name.toUpperCase()} fainted!`;
            endBattle();
        }, 2000);
        return;
    }

    updateMenu("main");

    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * opponentPokemon.moves.length);
        const opponentMove = opponentPokemon.moves[randomIndex];

        let damageToPlayer = calculateDamage(opponentPokemon, playerPokemon, opponentMove);
        playerPokemon.hp = Math.max(0, playerPokemon.hp - damageToPlayer);

        document.getElementById("player-hp-text").innerHTML = `${playerPokemon.hp}/${playerPokemon.maxhp}`;
        let playerHpProcent = (playerPokemon.hp / playerPokemon.maxhp) * 100;
        document.getElementById("player-hp-fill").style.width = `${playerHpProcent}%`;

        let opponentEffectivenessText = "";
        if (opponentMove.lastEffectiveness > 1) opponentEffectivenessText = `<br>It's super effective!`;
        if (opponentMove.lastEffectiveness < 1) opponentEffectivenessText = `<br>It's not very effective...`;
        if (opponentMove.lastEffectiveness === 0) opponentEffectivenessText = `<br>It has no effect...`;


        logElement.innerHTML = `Foe ${opponentPokemon.name.toUpperCase()} used ${opponentMove.name.toUpperCase()}!${opponentEffectivenessText}`;

        if (playerPokemon.hp <= 0) {
            setTimeout(() => {
                logElement.innerHTML = `${playerPokemon.name.toUpperCase()} fainted...`;
                endBattle();
            }, 2000);
        } else {
            setTimeout(() => {
             if (logElement) logElement.innerText = `What will ${playerPokemon.name.toUpperCase()} do?`;
             isPlayerTurn = true;
            }, 1000);
        }
    }, 1000);
    
}

function endBattle() {
    isBattleActive = false;
    isPlayerTurn = true;
    currentMenuState = "start";
    const button1 = document.getElementById("button-1");
    button1.innerText = "NEXT FIGHT";

    document.getElementById("button-2").innerText = "-";
    document.getElementById("button-3").innerText = "-";
    document.getElementById("button-4").innerText = "-";

}