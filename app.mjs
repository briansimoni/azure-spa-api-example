import { Issuer, generators } from 'openid-client';
import open from 'open'
import koa from 'koa'
import Router from '@koa/router'


const azureIssuer = await Issuer.discover('https://login.microsoftonline.com/5063e2f5-e7fd-408d-92bc-e69455161a97/v2.0/.well-known/openid-configuration')

const client = new azureIssuer.Client({
    client_id: '81ff8b7f-a2fa-4150-b800-66e5944a9f39',
    redirect_uris: 'http://localhost:9000/callback'
})

const codeVerifier = generators.codeVerifier()
const codeChallenge = generators.codeChallenge(codeVerifier)

const authorizationUrl = client.authorizationUrl({
    scope: 'openid profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
})

open(authorizationUrl)

const app = new koa()
const router = new Router()

router.get('/callback', async (ctx) => {
    const params = client.callback(ctx.req)
    const tokenSet = await client.callback('https://client.example.com/callback', params, { code_verifier });
    console.log(tokenSet)
})

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(9000, 'localhost', () => {
    console.log('server started')
})