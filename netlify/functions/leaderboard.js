const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
  const sql = neon(process.env.DATABASE_URL);

  if (event.httpMethod === 'POST') {
    // Save score to database
    const { username, score, duration, success, numbers, hideDelay, totalRounds, date } = JSON.parse(event.body);
    await sql`
      INSERT INTO leaderboard (username, score, duration, success, numbers, hide_delay, total_rounds, date)
      VALUES (${username}, ${score}, ${duration}, ${success}, ${numbers}, ${hideDelay}, ${totalRounds}, ${date})
    `;
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Score saved successfully' }),
    };
  } else if (event.httpMethod === 'GET') {
    // Retrieve leaderboard
    const result = await sql`SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10`;
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Unsupported method' }),
  };
};