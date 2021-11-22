/* global createAuth0Client */

// retrieve auth config
async function fetchAuthConfig() {
  const response = await fetch('/auth-config');
  if (response.ok) {
    return response.json();
  } else {
    throw response;
  }
}

let auth0 = null;

async function configureClient() {
  const config = await fetchAuthConfig();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
    audience: config.audience,
  });
}

function setupListeners() {
  document.getElementById('login').addEventListener('click', login);
  document.getElementById('logout').addEventListener('click', logout);
  document.getElementById('call').addEventListener('click', callServer);
}

async function updateAuthUI() {
  const isAuthenticated = await auth0.isAuthenticated();

  document.getElementById('login').disabled = isAuthenticated;
  document.getElementById('logout').disabled = !isAuthenticated;

  if (isAuthenticated) {
    const user = await auth0.getUser();
    const el = document.getElementById('greeting');
    el.textContent = 'Hello ' + user.name + '!';
  }
}

async function login() {
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin,
  });
}

function logout() {
  auth0.logout({
    returnTo: window.location.origin,
  });
}

// check for the code and state parameters from Auth0 login redirect
async function handleAuth0Redirect() {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) return;

  const query = window.location.search;
  if (query.includes('state=')) {
    try {
      // process the login state
      await auth0.handleRedirectCallback();
    } catch (e) {
      window.alert(e.message || 'authentication error, sorry');
      logout();
    }

    // remove the query parameters
    window.history.replaceState({}, document.title, '/');

    await updateAuthUI();
  }
}

async function callServer() {
  const token = await auth0.getTokenSilently();

  const el = document.getElementById('server-response');
  el.textContent = 'loading…';

  const fetchOptions = {
    credentials: 'same-origin',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token },
  };
  const response = await fetch('/api/hello', fetchOptions);
  if (!response.ok) {
    // handle the error
    el.textContent = 'Server error:\n' + response.status;
    return;
  }

  // handle the response
  const data = await response.text();
  console.log('setting text content: ' + data);
  el.textContent = data;
}

async function init() {
  await configureClient();
  await setupListeners();
  await updateAuthUI();
  await handleAuth0Redirect();
}

window.addEventListener('load', init);
