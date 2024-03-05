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
  </head>
  <body>
    <h1>
      Hello from Render!
    </h1>
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
