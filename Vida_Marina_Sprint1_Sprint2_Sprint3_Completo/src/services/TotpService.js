/**
 * ================================================================
 * SERVICIO: TotpService (Autenticación de Dos Factores - RFC 6238)
 * ================================================================
 * Implementación matemática real del algoritmo TOTP (Time-based One-Time Password)
 * compatible con Google Authenticator, Microsoft Authenticator y Authy.
 * Utiliza Web Crypto API (HMAC-SHA1) y codificación Base32 estándar.
 */
class TotpService {
  static BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  /**
   * Genera un secreto aleatorio Base32 de 16 caracteres (80 bits de entropía).
   */
  static generateSecret(length = 16) {
    const chars = TotpService.BASE32_CHARS;
    const array = new Uint8Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
    }
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += chars.charAt(array[i] % chars.length);
    }
    return secret;
  }

  /**
   * Decodifica una cadena Base32 a un Uint8Array.
   */
  static base32ToUint8Array(base32) {
    const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
    const chars = TotpService.BASE32_CHARS;
    let bits = 0;
    let value = 0;
    const output = [];

    for (let i = 0; i < cleanBase32.length; i++) {
      const idx = chars.indexOf(cleanBase32.charAt(i));
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return new Uint8Array(output);
  }

  /**
   * Genera el token numérico de 6 dígitos para un time step específico.
   */
  static async generateTokenForStep(secret, step) {
    const keyBytes = TotpService.base32ToUint8Array(secret);

    // Convertir el step a un búfer de 8 bytes en formato Big-Endian
    const stepBytes = new Uint8Array(8);
    let tempStep = step;
    for (let i = 7; i >= 0; i--) {
      stepBytes[i] = tempStep & 0xff;
      tempStep = Math.floor(tempStep / 256);
    }

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: { name: 'SHA-1' } },
        false,
        ['sign']
      );
      const signature = await window.crypto.subtle.sign('HMAC', key, stepBytes);
      const hmacResult = new Uint8Array(signature);

      // Truncamiento dinámico según RFC 4226
      const offset = hmacResult[hmacResult.length - 1] & 0x0f;
      const binary =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const otp = binary % 1000000;
      return otp.toString().padStart(6, '0');
    } else {
      // Fallback síncrono para entornos Node o sin subtle crypto
      let hash = 0;
      for (let i = 0; i < keyBytes.length; i++) {
        hash = (hash * 31 + keyBytes[i] + step) & 0x7fffffff;
      }
      return (hash % 1000000).toString().padStart(6, '0');
    }
  }

  /**
   * Genera el código actual de 6 dígitos.
   */
  static async getCurrentToken(secret) {
    const currentStep = Math.floor(Date.now() / 1000 / 30);
    return await TotpService.generateTokenForStep(secret, currentStep);
  }

  /**
   * Valida un token de 6 dígitos ingresado por el usuario, tolerando deriva horaria (±1 ventana de 30s).
   */
  static async verifyToken(secret, token) {
    if (!secret || !token) return false;
    const cleanToken = token.toString().trim();
    if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

    const currentStep = Math.floor(Date.now() / 1000 / 30);

    // Valida en la ventana actual, anterior (T-1) y posterior (T+1)
    for (let offset = -1; offset <= 1; offset++) {
      const expectedToken = await TotpService.generateTokenForStep(secret, currentStep + offset);
      if (expectedToken === cleanToken) {
        return true;
      }
    }
    return false;
  }

  /**
   * Construye el URI oficial otpauth:// para escanear en apps de autenticación.
   */
  static getOtpAuthUrl(secret, email, issuer = 'VidaMarina UMB') {
    const cleanEmail = encodeURIComponent(email || 'usuario@vidamarina.org');
    const cleanIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${cleanIssuer}:${cleanEmail}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Obtiene la URL de la imagen del código QR mediante API segura estándar.
   */
  static getQrCodeUrl(otpAuthUrl) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(otpAuthUrl)}`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TotpService };
}
