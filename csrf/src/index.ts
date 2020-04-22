import * as express from 'express';
import { urlencoded, json } from 'body-parser';

const port = 3000;
const app = express()
	.use(urlencoded({ extended : true }))
	.use(json());

app.get('/', (_, res) => {
	res.sendFile(`${__dirname}/views/index.html`);
});

app.get('*', (_, res) => {
	res.redirect('/');
});


app.listen(port, () => console.log('\x1b[36m%s\x1b[0m', `Listening at http://localhost:${port}`));
