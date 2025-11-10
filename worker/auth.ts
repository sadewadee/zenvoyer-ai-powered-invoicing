// In a real app, use a secure, randomly generated secret and store it as a secret variable.
const JWT_SECRET = 'your-super-secret-key-that-is-at-least-32-bytes-long';
const textEncoder = new TextEncoder();
async function getCryptoKey(secret: string) {
  const keyData = textEncoder.encode(secret);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}
function base64UrlEncode(data: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function base64UrlDecode(str: string): ArrayBuffer {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const decoded = atob(str);
  const buffer = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    buffer[i] = decoded.charCodeAt(i);
  }
  return buffer.buffer;
}
export async function signToken(payload: object): Promise<string> {
  const key = await getCryptoKey(JWT_SECRET);
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(textEncoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(textEncoder.encode(JSON.stringify(payload)));
  const dataToSign = textEncoder.encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign('HMAC', key, dataToSign);
  const encodedSignature = base64UrlEncode(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      return null;
    }
    const key = await getCryptoKey(JWT_SECRET);
    const dataToVerify = textEncoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signature = base64UrlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify('HMAC', key, signature, dataToVerify);
    if (!isValid) {
      return null;
    }
    const decodedPayload = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    return JSON.parse(decodedPayload) as T;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}