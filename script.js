// https://documenter.getpostman.com/view/11586746/SztEa7bL#intro

const baseUrl = 'http://ergast.com/api/f1/current/drivers.json';
const baseYearUrl = "http://ergast.com/api/f1";
// sest alonso on praegu vanim ning ta hakkas sõitma 2001
const startYear = 2000;
const endYear = 2024;
const aggregatedStats = {}; // võidud ja punktid


async function fetchCurrentDrivers() {
    document.getElementById('loading-sonum').style.display = 'block'; // naita
    try {
        const response = await fetch(baseUrl); // send an HTTP request
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json(); // converts HTTP response from JSON js obj
        const drivers = data.MRData.DriverTable.Drivers; 
        await fetchAndAggregateStats(); // ensures function is completed enne kui edasi laheb
        displayDrivers(drivers);
    } catch (error) {
        console.error("Neid ei kannatanud fetch'ida: ", error);
        document.getElementById('drivers-container').innerText = 'Failed to load driver data';
    } finally {
        document.getElementById('loading-sonum').style.display = 'none'; // bloki
    }
}
        
// aastate andmed
async function fetchYearData(year) {
    const response = await fetch(`${baseYearUrl}/${year}/driverStandings.json`);
    if (!response.ok) throw new Error(`Failed to fetch data for year ${year}`);
    const data = await response.json();
    return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || []; // checks if StandingsLists exist and has an entry
}

// sõitjate võidud ja punktid
function aggregateStats(driverData) {
    driverData.forEach(driver => { // iga driver eraldi
        const driverId = driver.Driver.driverId;
        if (!aggregatedStats[driverId]) {
            aggregatedStats[driverId] = {
                name: `${driver.Driver.givenName} ${driver.Driver.familyName}`,
                nationality: driver.Driver.nationality,
                wins: 0,
                points: 0
            };
        }

        const wins = parseInt(driver.wins, 10) || 0;
        const points = parseFloat(driver.points) || 0;

        aggregatedStats[driverId].wins += wins;
        aggregatedStats[driverId].points += points;
    });
}        

    
async function fetchAndAggregateStats() {
    const fetchPromises = []; // promises - objects which represents the current state of the operation (completed, rejected, pending)
    for (let year = startYear; year <= endYear; year++) {
        fetchPromises.push(fetchYearData(year).catch(error => { // uus promise
            console.error(`Error fetching data for year ${year}:`, error);
            return [];
        }));
    }

    const results = await Promise.all(fetchPromises); // jooksutab paraleelselt
    results.forEach(yearData => aggregateStats(yearData)); // yearData on driver standings per konkreetne aasta. kogub kõik punktid mitme aasta peale kokku
}       
   
const poleEnam = [
    "Valtteri Bottas", 
    "Kevin Magnussen",
    "Sergio Pérez",
    "Daniel Ricciardo",
    "Logan Sargeant",
    "Guanyu Zhou"
];


function displayDrivers(drivers) {
    const container = document.getElementById('drivers-container');
    container.innerHTML = '';

    drivers.forEach(driver => {
        const driverFullName = `${driver.givenName} ${driver.familyName}`;
        if (poleEnam.includes(driverFullName)) {
            return;
        }

        const driverId = driver.driverId;
        const stats = aggregatedStats[driverId];

        const card = document.createElement('div'); // uus div element driverite presentimiseks
        card.className = 'driver-card';

        card.innerHTML = `
            <h2>${driverFullName}</h2>
            <img class="driver-image" 
                src="images/${driverFullName}.avif" 
                alt="${driverFullName}"
                onerror="this.onerror=null; this.src='images/kuipole.avif';"
            >
        `;

        card.addEventListener('click', () => {
            openAken(driver, stats);
        });

        container.appendChild(card); // lisab uued sõitjate kaaridid
    });
}


const varvid = {
    "George Russell": "#00D2BE", 
    "Max Verstappen": "#0600EF", 
    "Liam Lawson": "#0600EF",
    "Lewis Hamilton": "#DC0000",
    "Charles Leclerc": "#DC0000",
    "Lando Norris": "#FF8700 ",
    "Oscar Piastri": "#FF8700 ",
    "Lance Stroll": "#006F62",
    "Fernando Alonso": "#006F62",
    "Alexander Albon": "#64C4FF",
    "Carlos Sainz": "#64C4FF",
    "Yuki Tsunoda": "#2B4562",
    "Pierre Gasly": "#0090FF",
    "Jack Doohan": "#0090FF",
    "Esteban Ocon": "#B6BABD",
    "Oliver Bearman": "#B6BABD",
    "Nico Hülkenberg": "#52E252"
};


function openAken(driver, stats) {
    document.getElementById('aken-name').textContent = driver.givenName + ' ' + driver.familyName;
    document.getElementById('aken-nationality').innerHTML = `<strong>Nationality:</strong> ${driver.nationality}`;
    document.getElementById('aken-dob').innerHTML = `<strong>Date of Birth:</strong> ${driver.dateOfBirth}`;
    document.getElementById('aken-car-number').innerHTML = `<strong>Car Number:</strong> ${driver.permanentNumber || 'N/A'}`;
    document.getElementById('aken-code').innerHTML = `<strong>Code:</strong> ${driver.code || 'N/A'}`;
    document.getElementById('aken-wins').innerHTML = `<strong>Total Wins:</strong> ${stats ? stats.wins : 'N/A'}`;
    document.getElementById('aken-points').innerHTML = `<strong>Total Points:</strong> ${stats ? stats.points.toFixed(2) : 'N/A'}`; // 2 kohta pärast koma



    // muudab popupi taustavärvi based on the driver
    const driverFullName = driver.givenName + ' ' + driver.familyName;
    const aken = document.getElementById('driverAken');
    const color = varvid[driverFullName] || "#f9f9f9";
    aken.querySelector('.aken-content').style.backgroundColor = color;


    
    document.getElementById('driverAken').style.display = 'flex';
    document.body.classList.add('aken-open');
}

function closeAken() {
    document.getElementById('driverAken').style.display = 'none';
    document.body.classList.remove('aken-open');
}

fetchCurrentDrivers();