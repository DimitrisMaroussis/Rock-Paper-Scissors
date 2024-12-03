let score = JSON.parse(localStorage.getItem('score')) || {
    wins: 0,
    losses: 0,
    ties: 0
};


updateScoreElement();

/*
if (!score) {
score = {
    wins: 0,
    losses: 0,
    ties: 0
};
}
*/
document.querySelector('.rockButton').addEventListener('click', () => {
    playGame('rock');
});

document.querySelector('.paperButton').addEventListener('click', () => {
    playGame('paper');
});

document.querySelector('.scissorsButton').addEventListener('click', () => {
    playGame('scissors');
});

document.querySelector('.autoPlay').addEventListener('click', () => {
    autoPlay();
});

document.querySelector('.resetScore').addEventListener('click', () => {
    score.wins = 0;
    score.losses = 0;
    score.ties = 0;
    updateScoreElement();
    localStorage.removeItem('score');
});

document.body.addEventListener('keydown', keyPressed => {
    if (keyPressed.key === 'p') {
        playGame('paper');
    } else if (keyPressed.key === 'r') {
        playGame('rock');
    } else if (keyPressed.key === 's') {
        playGame('scissors');
    }
})

let autoPlayOn = false;
let intervalId;

function autoPlay() {
    const autoButton = document.querySelector('.autoPlay');
    if(!autoPlayOn) {
        autoButton.classList.add('stopAutoPlay');
        autoButton.innerHTML = 'Stop';

        intervalId = setInterval(() => {
            playGame(pickComputerMove());
        }, 1000);
        autoPlayOn = true;
        console.log(autoPlayOn);
    } else {
        autoButton.classList.remove('stopAutoPlay');
        autoButton.innerHTML = 'Auto Play';

        clearInterval(intervalId);
        autoPlayOn = false;
    }
}

function playGame(playerMove) {
    const computerMove = pickComputerMove();

    let result = '';

    if (playerMove === 'scissors') {
        if (computerMove === 'rock') {
        result = 'You lose.';
        } else if (computerMove === 'paper') {
        result = 'You win.';
        } else if (computerMove === 'scissors') {
        result = 'Tie.';
        }

    } else if (playerMove === 'paper') {
        if (computerMove === 'rock') {
        result = 'You win.';
        } else if (computerMove === 'paper') {
        result = 'Tie.';
        } else if (computerMove === 'scissors') {
        result = 'You lose.';
        }
        
    } else if (playerMove === 'rock') {
        if (computerMove === 'rock') {
        result = 'Tie.';
        } else if (computerMove === 'paper') {
        result = 'You lose.';
        } else if (computerMove === 'scissors') {
        result = 'You win.';
        }
    }

    if (result === 'You win.') {
        score.wins += 1;
    } else if (result === 'You lose.') {
        score.losses += 1;
    } else if (result === 'Tie.') {
        score.ties += 1;
    }

    localStorage.setItem('score', JSON.stringify(score));

    updateScoreElement();

    document.querySelector('.js-result').innerHTML = result;

    document.querySelector('.js-moves').innerHTML = `You <img src="images/${playerMove}-emoji.png" class="moveIcons" alt="${playerMove} emoji">  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Computer <img src="images/${computerMove}-emoji.png" class="moveIcons" alt="${computerMove} emoji">`;
}



function updateScoreElement() {
    document.querySelector('.js-score')
        .innerHTML = `Wins: ${score.wins} &nbsp; Losses: ${score.losses} &nbsp; Ties: ${score.ties}`;
}


function pickComputerMove() {
    const randomNumber = Math.random();

    let computerMove = '';

    if (randomNumber < 1 / 3) {
        computerMove = 'rock';
    } else if (randomNumber < 2 / 3) {
        computerMove = 'paper';
    } else if (randomNumber < 1) {
        computerMove = 'scissors';
    }

    return computerMove;
}