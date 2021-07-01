const apiId = '75co9pj2n6'
const region = 'us-east-1'
const devPort = '3050'

export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`
export const devapiEndpoint = `http://localhost:${devPort}/dev`
export const subDirectory = 'Events'

export const authConfig = {
  domain: 'rashmijoyappa-dev.us.auth0.com',
  clientId: 'MFMkU4G4h3NYvxuNqFrButmvc7P6P4fw',
  callbackUrl: 'http://localhost:3000/callback'
}
