import jwt from "jsonwebtoken";

// Sample RSA public key components
const publicKey = {
  e: "AQAB",
  kty: "RSA",
  n:
    "vQ6s2FUnjfE3ZhC8fTWVdK1nFNLhkhbyijrLgs75LGKBHeAlXiQXwloSLnWrHqqcmR-IMeaqaTGFkF7WuX33h93fBIOZTtj2j1o_1Ccbmp7SdFJqszwVUiLxCRAMiOBmU6d24szDLKj-_XJgePKj-vwK_TPMXKh2MWiuwJoqAzMWgerBFzxU1fubmq3Kjd_IDLYqZzuPx7u2Mq9_-uCg075_7rk7T6OWsLPJMx52TCPDqAzILkJCY03T11QiBRkLlaerHztRf_5OzVm1cn0LXEzD7hEkQHREZ2JYsVHgDFtR9YYoj4u5toXRqchNe5-rf8Hb8kR6vJdHU_YmzXImvw",
};

// Generate JWT token using RSA private key
function generateToken(payload: object, privateKey: string): string {
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return token;
}

// Usage example
// const payload = { userId: '1234567890', name: 'John Doe' };
// const privateKey = 'your_private_key_here';
// const token = generateToken(payload, privateKey);
