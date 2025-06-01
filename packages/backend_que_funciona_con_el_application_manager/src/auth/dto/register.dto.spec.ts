import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';
import { validate } from 'class-validator';
const expectedPasswordError =
  'Password is too weak. It must contain at least an uppercase letter, a lowercase letter, a number, be at least 8 characters long, and at most 64 characters long.';

const getErrors = async (_class: any, obj: any) => {
  const instance = plainToInstance(_class, obj);
  const errors = await validate(instance);
  if (errors.length === 0) return '';
  return JSON.stringify(errors);
};
describe('RegisterDto test', () => {
  it('checks valid password: min 8 chars, 1 uppercase, 1 lowercase, 1 number', async () => {
    const email = 'example@example.com';
    const emailVerificationCode = '123456';
    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: 'Password1',
      }),
    ).toBe('');
    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: 'password1',
      }),
    ).toContain(expectedPasswordError);

    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: 'Password',
      }),
    ).toContain(expectedPasswordError);

    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: 'password',
      }),
    ).toContain(expectedPasswordError);

    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: '12345678',
      }),
    ).toContain(expectedPasswordError);

    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: 'short',
      }),
    ).toContain(expectedPasswordError);

    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: 'Password' + '1'.repeat(64 - 7),
      }),
    ).toContain(expectedPasswordError);

    expect(
      await getErrors(RegisterDto, {
        email,
        emailVerificationCode,
        password: 'Password' + '1'.repeat(64 - 8),
      }),
    ).toBe('');
  });
});
