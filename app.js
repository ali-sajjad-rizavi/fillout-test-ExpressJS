const express = require("express");
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type('html').send(html));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const API_KEY = "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render (Edited)!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`

app.get('/:formId/filteredResponses', async (req, res) => {
    const { formId } = req.params;
    const filters = JSON.parse(req.query.filters || '[]');

    try {
        const response = await axios.get(`https://api.fillout.com/v1/api/forms/${formId}/submissions`, {
            headers: { Authorization: `Bearer ${API_KEY}` },
            params: req.query
        });

        const responses = response.data.responses;

        const isConditionTrue = (a, b, condition) => {
            switch (condition) {
                case "equals": return a == b;
                case "does_not_equal": return a != b;
                case "greater_than": return a > b;
                case "less_than": return a < b;
                default: return false;
            }
        };

        console.log("filters are", filters);

        const filteredResponses = responses.filter(r => {
            const questionLookup = r.questions.reduce((acc, question) => {
                acc[question.id] = question;
                return acc;
            }, {});

            return filters.every(f =>
                isConditionTrue(questionLookup[f.id]?.value, f.value, f.condition)
            );
        });

        res.json({ ...response.data, responses: filteredResponses, total_responses: filteredResponses.length });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the data');
    }
});
