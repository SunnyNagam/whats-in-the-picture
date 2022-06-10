// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const axios = require('axios')
const API_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

const handler = async (event) => {
  try {
    const subject = event.queryStringParameters.word;
    let resp = await axios.get(API_ENDPOINT+subject);
    console.log(resp);
    return {
      statusCode: 200,
      body: JSON.stringify(resp.data[0].meanings[0].definitions[0].definition),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
