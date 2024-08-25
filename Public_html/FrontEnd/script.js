const symbols = ['🍒', '🍊', '🍋', '🍇', '🍉', '🍓'];
let totalSpins = 0;
let totalWins = 0;
let currentPlayerName = null;
let leaderboard = []; // Initialize leaderboard with empty array

let db; // IndexedDB database instance

// Open IndexedDB database
const request = window.indexedDB.open('slotMachineDB', 1);

// Setup IndexedDB database schema
request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Create object store for leaderboard and total wins
    if (!db.objectStoreNames.contains('leaderboard')) {
        db.createObjectStore('leaderboard', { keyPath: 'name' });
        console.log('Leaderboard object store created');
    }
    if (!db.objectStoreNames.contains('totalWins')) {
        const totalWinsStore = db.createObjectStore('totalWins', { keyPath: 'id' });
        // Add dummy totalWins value
        totalWinsStore.transaction.oncomplete = function(event) {
            const totalWinsObjectStore = db.transaction('totalWins', 'readwrite').objectStore('totalWins');
            totalWinsObjectStore.add({ id: 'totalWins', value: 0 });
            console.log('Dummy totalWins value added');
        };
    }
};

request.onsuccess = function(event) {
    db = event.target.result;

    // Load leaderboard data from IndexedDB
    loadDataFromDB();
};

request.onerror = function(event) {
    console.error('Error opening database:', event.target.errorCode);
};

// Function to load data from IndexedDB
function loadDataFromDB() {
    const transaction = db.transaction(['leaderboard', 'totalWins'], 'readonly');
    const leaderboardStore = transaction.objectStore('leaderboard');
    const totalWinsStore = transaction.objectStore('totalWins');

    const getAllLeaderboardRequest = leaderboardStore.getAll();
    const getTotalWinsRequest = totalWinsStore.get('totalWins');

    getAllLeaderboardRequest.onsuccess = function(event) {
        leaderboard = event.target.result || [];
        console.log('Loaded leaderboard:', leaderboard);
        displayLeaderboard(); // Display leaderboard after loading
    };

    getTotalWinsRequest.onsuccess = function(event) {
        const result = event.target.result;
        if (result) {
            totalWins = result.value;
            console.log('Loaded totalWins:', totalWins);
            updateStats();
        }
    };

    getAllLeaderboardRequest.onerror = function(event) {
        console.error('Error loading leaderboard data from database:', event.target.errorCode);
    };

    getTotalWinsRequest.onerror = function(event) {
        console.error('Error loading total wins from database:', event.target.errorCode);
    };
}

// Function to save leaderboard data to IndexedDB
function saveLeaderboardToDB() {
    const transaction = db.transaction(['leaderboard'], 'readwrite');
    const leaderboardStore = transaction.objectStore('leaderboard');

    leaderboard.forEach(player => {
        leaderboardStore.put(player); // Put each player into the store
    });

    transaction.oncomplete = function() {
        console.log('Leaderboard data saved successfully');
    };

    transaction.onerror = function(event) {
        console.error('Error saving leaderboard data:', event.target.errorCode);
    };
}

// Function to save total wins to IndexedDB
function saveTotalWinsToDB() {
    const transaction = db.transaction(['totalWins'], 'readwrite');
    const totalWinsStore = transaction.objectStore('totalWins');

    totalWinsStore.put({ id: 'totalWins', value: totalWins });

    transaction.oncomplete = function() {
        console.log('Total wins saved successfully');
    };

    transaction.onerror = function(event) {
        console.error('Error saving total wins:', event.target.errorCode);
    };
}

// Function to generate a random symbol
function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols[randomIndex];
}

// Function to spin the slot machine
function spin() {
    totalSpins++;

    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const slot3 = document.getElementById('slot3');

    const symbol1 = getRandomSymbol();
    const symbol2 = getRandomSymbol();
    const symbol3 = getRandomSymbol();

    slot1.textContent = symbol1;
    slot2.textContent = symbol2;
    slot3.textContent = symbol3;

    if (symbol1 === symbol2 && symbol2 === symbol3) {
        totalWins++;
        saveTotalWinsToDB(); // Save total wins after each win

        if (!currentPlayerName) {
            currentPlayerName = prompt('Congratulations! You won the jackpot! Enter your name to add to the leaderboard:');
        }
        
        if (currentPlayerName) {
            updateLeaderboard(currentPlayerName);
        }
        
        updateStats();
    } else {
        document.getElementById('result').textContent = 'Try again!';
    }
}

// Function to update game statistics
function updateStats() {
    document.getElementById('totalSpins').textContent = totalSpins;
    document.getElementById('totalWins').textContent = totalWins;
}

// Function to update or add player to leaderboard and store in IndexedDB
function updateLeaderboard(playerName) {
    // Check if the player already exists in the leaderboard
    const playerIndex = leaderboard.findIndex(player => player.name === playerName);

    if (playerIndex !== -1) {
        // If player exists, update their wins
        leaderboard[playerIndex].wins = totalWins; // Set wins to the current totalWins
    } else {
        // If player doesn't exist, add them to the leaderboard
        leaderboard.push({ name: playerName, wins: totalWins }); // Initialize wins to the current totalWins
    }

    // Sort leaderboard by wins in descending order
    leaderboard.sort((a, b) => b.wins - a.wins);

    // Keep only top 5 players
    leaderboard = leaderboard.slice(0, 5);

    // Store updated leaderboard in IndexedDB
    saveLeaderboardToDB();

    // Display updated leaderboard
    displayLeaderboard();
}

// Function to display leaderboard
function displayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = ''; // Clear previous entries

    leaderboard.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${player.name} - Wins: ${player.wins}`;
        leaderboardList.appendChild(li);
    });
}

// Initial display of leaderboard
window.onload = function() {
    loadDataFromDB();
    updateStats(); // Update stats when page loads
};