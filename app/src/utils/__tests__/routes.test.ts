import { describe, expect, it } from 'vitest';
import { href, parseRoute } from '../routes';

describe('routes', () => {
  it('should parse known paths', () => {
    expect(parseRoute('/')).toEqual({ page: 'browse' });
    expect(parseRoute('/history')).toEqual({ page: 'history' });
    expect(parseRoute('/saved/')).toEqual({ page: 'saved' });
    expect(parseRoute('/playlists')).toEqual({ page: 'playlists' });
    expect(parseRoute('/playlist/abc%20def')).toEqual({ page: 'playlist', playlistId: 'abc def' });
    expect(parseRoute('/watch/fNk_zzaMoSs')).toEqual({ page: 'watch', vid: 'fNk_zzaMoSs' });
  });

  it('should send unknown paths home', () => {
    expect(parseRoute('/missing')).toEqual({ page: 'browse' });
    expect(parseRoute('/watch/')).toEqual({ page: 'browse' });
  });

  it('should round-trip routes', () => {
    const route = { page: 'watch' as const, vid: 'abc def' };
    expect(parseRoute(href(route))).toEqual(route);
  });
});
