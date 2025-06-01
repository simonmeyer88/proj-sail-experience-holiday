import { exclude } from './exclude';

describe('exclude function', () => {
  it('should omit specified keys from the user object', () => {
    const user = {
      name: 'John Doe',
      age: 30,
      email: 'john.doe@example.com',
    };

    const result = exclude(user, ['age', 'email']);

    expect(result).toEqual({ name: 'John Doe' });
  });

  it('should return the same object if no keys are specified', () => {
    const user = {
      name: 'John Doe',
      age: 30,
      email: 'john.doe@example.com',
    };

    const result = exclude(user, []);

    expect(result).toEqual(user);
  });
});
