import { describe, expect, it } from 'vitest';
import { submissionValidator } from '../src/validators/submissionValidator';

const request = (body: unknown) => ({ body }) as any;

describe('submission validation', () => {
  it('accepts an empty answer list for a partial submission', () => {
    expect(() => submissionValidator.submit(request({ answers: [] }))).not.toThrow();
  });

  it('rejects duplicated question answers', () => {
    expect(() => submissionValidator.submit(request({ answers: [
      { questionId: 1, choiceId: 2 },
      { questionId: 1, choiceId: 3 }
    ] }))).toThrow('Une question ne peut apparaître qu’une seule fois');
  });

  it('rejects invalid answer identifiers', () => {
    expect(() => submissionValidator.submit(request({ answers: [{ questionId: 0, choiceId: 1 }] }))).toThrow();
    expect(() => submissionValidator.submit(request({ answers: [{ questionId: 1, choiceId: -2 }] }))).toThrow();
  });
});
