// Function to display the leaderboard
function displayLeaderboard() {
    const leaderboardData = JSON.parse(localStorage.getItem('users'));
    
    // Sort users by score in descending order
    const sortedUsers = leaderboardData.sort((a, b) => b.score - a.score);
    
    // Display the top 3 users on the stairs
    if (sortedUsers.length >= 3) {
        document.getElementById('first-name').textContent = sortedUsers[0].username;
        document.getElementById('first-score').textContent = `Score: ${sortedUsers[0].score}`;

        document.getElementById('second-name').textContent = sortedUsers[1].username;
        document.getElementById('second-score').textContent = `Score: ${sortedUsers[1].score}`;

        document.getElementById('third-name').textContent = sortedUsers[2].username;
        document.getElementById('third-score').textContent = `Score: ${sortedUsers[2].score}`;
    }

    // Display the rest of the users in the table
    const leaderboardTable = document.querySelector('#leaderboard tbody');
    sortedUsers.slice(3).forEach((user, index) => {
        const row = document.createElement('tr');
        
        // Create rank, username, and score cells
        const rankCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const scoreCell = document.createElement('td');
        
        rankCell.textContent = index + 4; // Start ranking from 4th
        nameCell.textContent = user.username;
        scoreCell.textContent = user.score;
        
        // Append cells to the row
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        
        // Append the row to the leaderboard table
        leaderboardTable.appendChild(row);
    });
}

// Call the function to display the leaderboard when the page loads
displayLeaderboard();