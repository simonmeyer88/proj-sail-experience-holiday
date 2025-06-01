export function extractTokenOrCodeFromEmailText(
  text: string,
  {
    mode,
  }: {
    mode?: "register" | "forgotPassword" | "changeEmail";
  }
) {
  if (mode === "register") {
    // Extract the code from the sentence 'Tú código es {{code}}' using regex
    const emailVerificationCodeMatch = text.match(
      /Tú código es ([a-zA-Z0-9]+)/
    );
    return emailVerificationCodeMatch[1];
  }

  if (mode === "forgotPassword") {
    // Extract the code from the sentence 'Introduce este codigo en la casilla correspondiente' followed by any number of whitespace characters and then the code
    const emailVerificationCodeMatch = text.match(
      /Introduce este código en la casilla correspondiente:\s*([a-zA-Z0-9]+)/
    );

    return emailVerificationCodeMatch[1];
  }

  if (mode === "changeEmail") {
    // Extract the code from the sentence 'Introduce este codigo en la casilla correspondiente' followed by any number of whitespace characters and then the code
    const emailVerificationCodeMatch = text.match(
      /Introduce este[\s\u00A0\u00AD]*código en la casilla correspondiente:[\s\u00A0\u00AD]*([a-zA-Z0-9]+)/
    );

    if (emailVerificationCodeMatch && emailVerificationCodeMatch[1]) {
      return emailVerificationCodeMatch[1];
    } else {
      throw new Error("Could not extract code from email text");
    }
  }

  throw new Error("Could not extract code from email text");
}
