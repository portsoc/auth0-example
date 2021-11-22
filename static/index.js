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

  document.getElementById('btn-logout').disabled = !isAuthenticated;
  document.getElementById('btn-login').disabled = isAuthenticated;
}

async function init() {
  await configureClient();
  await updateAuthUI();
}

window.addEventListener('load', init);
