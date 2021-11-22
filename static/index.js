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
  });
}

async function updateAuthUI() {
  const isAuthenticated = await auth0.isAuthenticated();

  const loginBtn = document.getElementById('login');
  loginBtn.disabled = isAuthenticated;
  loginBtn.addEventListener('click', login);

  const logoutBtn = document.getElementById('logout');
  logoutBtn.disabled = !isAuthenticated;
  logoutBtn.addEventListener('click', logout);

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

async function init() {
  await configureClient();
  await updateAuthUI();
  await handleAuth0Redirect();
}

window.addEventListener('load', init);
