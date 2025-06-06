const { JWT } = require('google-auth-library');

/**
 * Netlify Function to obtain an access token using a service account.
 */
exports.handler = async (event) => {
  try {
    // 1. Parse spreadsheet and sheet name from the request body
    const { spreadsheetId, sheetName } = JSON.parse(event.body);

    if (!spreadsheetId || !sheetName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing spreadsheetId or sheetName in request body' }),
      };
    }

    // 2. Read credentials directly from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT);
    
    // 3. Create a JWT client using the service account credentials
    const auth = new JWT(
      credentials.client_email,
      null, 
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // 4. Authorize the client and get an access token
    await auth.authorize();
    const { token } = await auth.getAccessToken();

    // 5. Return the access token in the response
    return {
      statusCode: 200,
      body: JSON.stringify({ access_token: token }),
    };
  } catch (error) {
    console.error('Error getting access token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        message: 'Failed to retrieve access token using service account.',
      }),
    };
  }
};