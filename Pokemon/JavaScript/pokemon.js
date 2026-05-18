let playerPokemon = null;
let opponentPokemon = null;
let currentMenuState = "start";
let isBattleActive = false;

async function getPokemonData(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const data = await response.json();

    const movePromises = data.moves.slice(0, 4).map(async (m) => {
        const moveResponse = await fetch(m.move.url);
        const moveData = await moveResponse.json();
        return {
            name: moveData.name,
            power: moveData.power || 40,
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
        sprite: data.sprites.front_default,
        moves: detailedMoves
    };
}

function calculateDamage(attacker, defender, move) {
        const level = 5;
        const power = move.power || 40;
        const adratio = attacker.attack / defender.defense;

        let damage = (((2 * level / 5 + 2) * power * adratio) / 50) + 2;

        const stab = attacker.types.includes(move.type) ? 1.5 : 1;
        const typeEffectiveness = 1;
        const randomFactor = Math.random() * (1.0 - 0.85) + 0.85;

        return Math.floor(damage * stab * typeEffectiveness * randomFactor)
    }

async function pokemonUpdate() {
    const playerPokemon = await getPokemonData(4);
    const opponentPokemon = await getPokemonData(7);

    document.getElementById("player-name").innerText = playerPokemon.name;
    document.getElementById("player-sprite").src = playerPokemon.sprite,
    document.getElementById("player-hp-text").innerText = `${playerPokemon.hp}/${playerPokemon.maxhp}`;
    document.getElementById("player-hp-fill").style.width = "100%";

    document.getElementById("opponent-name").innerText = opponentPokemon.name;
    document.getElementById("opponent-sprite").src = opponentPokemon.sprite
    document.getElementById("opponent-hp-fill").style.width = "100%";

    isBattleActive = true;
    updateMenu("main");
}

function handleMenuClick(buttonNumber) {
    const logElement = document.getElementById("log-text");

    if (!isBattleActive) {
        if (buttonNumber === 1) pokemonUpdate();
        return;
    }

    if (currentMenuState === "main") {
        if (buttonNumber === 1) {
            updateMenu("fight");
        }
        else if (buttonNumber === 2) {
            updateMenu("bag");
        }
        else if (buttonNumber === 3) {
            updatemenu("Pokemon")
        }
        else if (buttonNumber === 4) {
            updateMenu("Run")
        }
    }

    else if (currentMenuState === "fight") {
        const chosenMove = playerPokemon.moves[buttonNumber - 1];
        executeTurn(chosenMove);
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
        button2.innerText = "Bag";
        button3.innerText = "Pokemon";
        button4.innerText = "Run";
    }

    else if (state === "fight") {
        button1.innerText = playerPokemon.moves[0] ? playerPokemon.moves[0].name.toUpperCase() : "-";
        
    }
}