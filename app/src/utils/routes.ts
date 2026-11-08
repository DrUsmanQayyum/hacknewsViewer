export type Route =
  | { page: 'browse' }
  | { page: 'history' }
  | { page: 'saved' }
  | { page: 'playlists' }
  | { page: 'playlist'; playlistId: string }
  | { page: 'watch'; vid: string };

export function parseRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { page: 'browse' };
  if (path === '/history') return { page: 'history' };
  if (path === '/saved') return { page: 'saved' };
  if (path === '/playlists') return { page: 'playlists' };

  if (path.startsWith('/playlist/')) {
    const playlistId = decodeURIComponent(path.slice('/playlist/'.length));
    return playlistId ? { page: 'playlist', playlistId } : { page: 'playlists' };
  }

  if (path.startsWith('/watch/')) {
    const vid = decodeURIComponent(path.slice('/watch/'.length));
    return vid ? { page: 'watch', vid } : { page: 'browse' };
  }

  return { page: 'browse' };
}

export function href(route: Route): string {
  switch (route.page) {
    case 'browse':
      return '/';
    case 'history':
      return '/history';
    case 'saved':
      return '/saved';
    case 'playlists':
      return '/playlists';
    case 'playlist':
      return `/playlist/${encodeURIComponent(route.playlistId)}`;
    case 'watch':
      return `/watch/${encodeURIComponent(route.vid)}`;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}
