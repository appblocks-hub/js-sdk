js-sdk
===========

Client libraries includes methods to use SHIELD, libraries to ease the use of Webpack Module Federation - Promise based loading. It provides the essential packages to facilitate appblocks features across appblocks applications.

As of now, js-sdk contains the following
- [shield](#shield)
- [ab-federation-helpers](#ab-federation-helpers)

shield helps to setup authentication for your application. It contains many methods to setup user authentication with shield and obtain tokens across appblocks applications.

ab-federation-helpers contains hooks and methods to facilitate federated Components and Modules

Installation
---------------
        npm i @appblocks/js-sdk

Usage
-----
        import { shield } from '@appblocks/js-sdk'

        import { useFederatedComponent } from '@appblocks/js-sdk'

---
# shield
js-sdk/shield includes the following elements
1. [tokenStore](#tokenstore)
2. [init](#init)
3. [verifyLogin](#verifylogin)
4. [verifyLoginWithoutRedirect](#verifyLoginWithoutRedirect)
5. [getAuthUrl](#getauthurl)
6. [logout](#logout)
7. [logoutWithoutRedirect](#logoutWithoutRedirect)
8. [validateAccessToken](#validateAccessToken)


## tokenStore

#### Description
Its an object which stores the token, refresh Token, expiry time as private variables along with related functions. It contains the timer id for the token

#### Usage
```javascript
shield.tokenStore.getToken()
```
## init

#### Description
Its used to initialise the tokenstore with values from the shield backend. It takes a parameter clientID which is unique for each application.

#### Usage
```javascript
await shield.init('#client-id')
```
## verifyLogin

#### Description
It retrieves for the token from the localStorage and validates the token. If the token is not valid it redirects to the shield login.

#### Usage
```javascript
const isLoggedinn = await shield.verifyLogin()
```
## verifyLoginWithoutRedirect

#### Description
It retrieves for the token from the localStorage and validates the token. If the token is not valid it checks for valid cookie and tries to login, else continues as not logged in and does not redirect.

#### Usage
```javascript
const isLoggedinn = await shield.verifyLoginWithoutRedirect()
```
## getAuthUrl

#### Description
It generates authorization URL with query parameters

#### Usage
```javascript
const authUrl = shield.getAuthUrl()
```
## logout

#### Description
It logs out the user by removing the token from localStorage and redirects to shield login.

#### Usage
```javascript
await shield.logout()
```    
## logoutWithoutRedirect

#### Description
It logs out the user by removing the token from localStorage but does not redirect to shield

#### Usage
```javascript
await shield.logoutWithoutRedirect()
```
## validateAccessToken
#### Description
It checks the validity of the token.It can be used to check if user is logged in or not.

#### Usage
```javascript
await shield.validateAccessToken()
```

---


# ab-federation-helpers
ab-federation-helpers includes the following elements
1. [useFederatedComponent](#usefederatedcomponent)
2. [useFederatedModule](#usefederatedmodule)
3. [useDynamicScript](#usedynamicscript)


## useFederatedComponent

#### Description
used to obtain federated Component . 

#### Usage
```javascript
const system = {
    module: './login',
    scope: 'login',
    url: 'http://localhost:3013/remoteEntry.js',
}
const { Component: FederatedComponent, errorLoading } = useFederatedComponent(
    system?.url,
    system?.scope,
    system?.module,
    React
)
return (
    <React.Suspense fallback={''}>
    {errorLoading
        ? `Error loading module "${module}"`
        : FederatedComponent && <FederatedComponent />}
    </React.Suspense>
)
```
## useFederatedModule

#### Description
used to obtain federated Module .

#### Usage
```javascript
const system = {
    module: './login',
    scope: 'login',
    url: 'http://localhost:3013/remoteEntry.js',
}
const { Component: FederatedModule, errorLoading } = useFederatedModule(
    system?.url,
    system?.scope,
    system?.module,
    React
)
```
## useDynamicScript

#### Description
loads script from remote URL.

#### Usage
```javascript
const { ready, errorLoading } = useDynamicScript(remoteUrl, React);
```

## useSuspense

#### Description
loading a javascript webpack module dyanmically onto a component

#### Usage
```javascript
const store = useSuspense(
    process.env.EMULATOR_REMOTE_ENTRY_PATH,
    'remotes',
    './store',
    React
)
```