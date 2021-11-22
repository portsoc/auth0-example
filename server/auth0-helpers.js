import OAuth2JWTBearer from 'express-oauth2-jwt-bearer';

import fetch from 'node-fetch';

const status401Errors = [
  'UnauthorizedError',
  'InvalidTokenError',
];

export function checkJwt(authConfig) {
  const checker = OAuth2JWTBearer.auth({
    audience: authConfig.audience,
    issuerBaseURL: `https://${authConfig.domain}`,
  });

  // wrap the checker to simply return 401 on invalid tokens
  return (req, res, next) => {
    return checker(req, res, (err) => {
      if (err && status401Errors.includes(err.name)) {
        res.sendStatus(401);
      } else {
        next(err);
      }
    });
  };
}

export async function getProfile(req, res, next) {
  if (!req.auth) {
    next();
    return;
  }

  try {
    const response = await fetch(req.auth.payload.aud[1], {
      method: 'GET',
      headers: {
        authorization: `Bearer ${req.auth.token}`,
      },
    });

    // console.log({ response });
    if (!response.ok) throw response;

    req.user = await response.json();
    next();
  } catch (err) {
    console.error('error getting auth profile', req.auth, err);
    next();
  }
}
