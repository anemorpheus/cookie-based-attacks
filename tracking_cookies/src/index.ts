import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { urlencoded, json } from 'body-parser';
import { renderFile } from 'ejs';

const port = 3000;
const app = express()
	.use(cookieParser())
	.use(urlencoded({ extended : true }))
	.use(json())
	.use(express.static(`${__dirname}/assets`))
	.set('views', __dirname + '/views')
	.engine('html', renderFile)
	.set('view engine', 'html');

const users: Users = { };

app.get('/', (req, res) => {
	let { adUserId } = req.cookies;
	const { website, adType } = req.query as { website: string, adType: Referer['adType'] };

	if (!adUserId || !users[adUserId]) {
		adUserId = generateToken();
		users[adUserId] = { token: adUserId, referers: [] };
		res.cookie('adUserId', adUserId);
	}
	
	const referer: Referer = { website, adType, timestamp: new Date().toTimeString() };
	users[adUserId].referers.push(referer);

	console.log(JSON.stringify(referer))

	res.render('ad.html', { majorInterest: getMajorInterest(users[adUserId]) });
});

app.get('/data', (_, res) => {
	res.render('data.html', { users: Object.values(users) });
});

app.listen(port, () => console.log('\x1b[36m%s\x1b[0m', `Listening at http://localhost:${port}`));

type Referer = { website: string, adType: 'bee' | 'bear', timestamp: string };
type Users = { [k in string]: UserData };
type UserData = { token: string, referers: Referer[] };

function generateToken(): string {
	return (Math.random() + 1).toString(36).substr(2, 5);
}
function getMajorInterest(userData: UserData): Referer['adType'] {
	const beeHits = userData.referers.filter(referer => referer.adType === 'bee');
	return beeHits.length > (userData.referers.length / 2) ? 'bee' : 'bear';
}
