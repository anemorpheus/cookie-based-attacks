import * as express from 'express';
import * as expressSession from 'express-session';
import * as https from 'https';
import * as fs from 'fs';
import { urlencoded, json } from 'body-parser';
import { renderFile } from 'ejs';

const port = 3000;
const app = express()
	.use(expressSession({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true
	}))
	.use(urlencoded({ extended : true }))
	.use(json())
	.set('views', __dirname + '/views')
	.engine('html', renderFile)
	.set('view engine', 'html');

const users: User[] = [
	{ username: 'mike', password: 'mike', balance: 1000 },
	{ username: 'john', password: 'john', balance: 1000 },
];

app.get('/', (req, res) => {
	if (!authorize(req, res)) return;
	const { user } = req.session as any;
	const balance = getUser(user.username).balance;

	res.render('index.html', { user, balance });
});

app.get('/login', (req, res) => {
	if (authorize(req, res, { redirect: false })) return res.redirect('/');

	res.render('login.html', { invalidCredentials: false });
});

app.post('/login', (req, res) => {
	if (authorize(req, res, { redirect: false })) return res.redirect('/');

	const { username, password } = req.body;
	if (!users.some(user => user.username === username && user.password === password)) {
		return res.render('login.html', { invalidCredentials: true });
	}

	(req.session as any).user = {
		username
	};
	return res.redirect('/');
});

app.post('/logout', (req, res) => {
	if (!authorize(req, res, { redirect: false })) return res.redirect('/');

	(req.session as any).user = undefined;
	return res.redirect('/');
});

app.post('/takeout', (req, res) => {
	if (!authorize(req, res)) return;
	const { user } = req.session as any;
	const { sum } = req.body;

	getUser(user.username).balance -= sum;
	return res.redirect('/');
});

app.get('*', (_, res) => {
	res.redirect('/');
});


https.createServer({
    key: fs.readFileSync('./localhost.key'),
    cert: fs.readFileSync('./localhost.crt'),
    passphrase: '0000'
}, app).listen(port, () => console.log('\x1b[36m%s\x1b[0m', `Listening at https://localhost:${port}`));

type User = { username: string, password: string, balance: number };
function authorize(req: express.Request, res: express.Response, { redirect } = { redirect: true }): boolean {
	if (!!req.session?.user) return true;

	if (redirect) res.redirect('/login');
	return false;
}
function getUser(username: string): User {
	return users.find(user => user.username === username) as User;
}
