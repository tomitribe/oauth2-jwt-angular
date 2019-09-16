import { GravatarPipe } from './gravatar.pipe';

describe('GravatarPipe', () => {
  it('create an instance', () => {
    const pipe = new GravatarPipe();
    expect(pipe).toBeTruthy();
  });

  it('pipe transform example test', () => {
    const pipe = new GravatarPipe();
    expect(pipe.transform('email@example.com')).toContain('5658ffccee7f0ebfda2b226238b1eb6e');
  });

  it('pipe transform empty test', () => {
    const pipe = new GravatarPipe();
    expect(pipe.transform(' ')).toEqual('//www.gravatar.com/avatar/?s=90');
  });
});
