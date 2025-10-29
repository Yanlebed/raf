export function getBackendBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
}

export function setTokenCookies(response, { accessToken, refreshToken, accessTtlSec = 60 * 30, refreshTtlSec = 60 * 60 * 24 * 7 }) {
  if (accessToken) {
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: accessTtlSec,
    });
  }
  if (refreshToken) {
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: refreshTtlSec,
    });
  }
}

export function clearTokenCookies(response) {
  response.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("refresh_token", "", { httpOnly: true, path: "/", maxAge: 0 });
}


