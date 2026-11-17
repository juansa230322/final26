/**
 * ================================================================
 * SERVICIO: AuthenticationService (Seguridad, Sesión y 2FA TOTP)
 * ================================================================
 * Encapsula la autenticación de usuarios, validación de contraseñas,
 * control de cuentas suspendidas y validación de doble factor (2FA).
 */
class AuthenticationService {
  constructor(databaseService, supabaseService) {
    this.db = databaseService;
    this.supabase = supabaseService;
  }

  async login(email, password, totpToken = null) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const user = this.db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'No se encontró ninguna cuenta registrada con este correo electrónico.' };
    }

    if (user.isSuspended()) {
      return { success: false, error: 'Esta cuenta ha sido suspendida temporalmente por la administración. Comuníquese con soporte.' };
    }

    if (!user.validatePassword(cleanPassword)) {
      return { success: false, error: 'Contraseña incorrecta. Por favor verifique sus credenciales.' };
    }

    // Validación de Doble Factor de Autenticación (2FA TOTP)
    if (user.has2FA()) {
      if (!totpToken) {
        // Requiere que el usuario ingrese su código de 6 dígitos
        return { success: false, requires2FA: true, userId: user.id, userEmail: user.email };
      }

      const isValidToken = await TotpService.verifyToken(user.twoFactorSecret, totpToken);
      if (!isValidToken) {
        return { success: false, error: 'Código de autenticación 2FA incorrecto o expirado. Ingrese el código actual de su aplicación.' };
      }
    }

    // Autenticación exitosa
    this.db.saveCurrentUserId(user.id);

    // Si Supabase está configurado, sincronizar sesión
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.signIn(cleanEmail, cleanPassword);
    }

    return { success: true, user };
  }

  async register({ name, email, password, city }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanName || cleanName.length < 3) {
      return { success: false, error: 'El nombre debe contener al menos 3 caracteres.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Ingrese una dirección de correo electrónico válida.' };
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres por seguridad.' };
    }

    const existing = this.db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    // Todo usuario nuevo se registra como Ciudadano (RF09)
    const newUser = new Citizen({
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      city: city ? city.trim() : 'Cartagena de Indias',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      role: 'Ciudadano',
      level: 1,
      xp: 50
    });

    this.db.users.unshift(newUser);
    this.db.saveUsers(this.db.users);
    this.db.saveCurrentUserId(newUser.id);

    // Notificación de bienvenida
    this.db.addNotification(
      new Notification({
        userId: newUser.id,
        title: '¡Bienvenido a Vida Marina UMB!',
        message: 'Tu cuenta ha sido creada exitosamente. Explora las actividades, reporta incidentes marinos y participa en el foro.',
        type: 'general'
      })
    );

    // Registro en Supabase si está disponible
    if (this.supabase && this.supabase.isConfigured()) {
      await this.supabase.signUp(cleanEmail, cleanPassword, { name: cleanName, city: newUser.city, role: 'Ciudadano' });
      await this.supabase.insertRecord('profiles', newUser.toJSON());
    }

    return { success: true, user: newUser };
  }

  async setup2FA(userId) {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Usuario no encontrado.' };

    const secret = TotpService.generateSecret(16);
    const otpAuthUrl = TotpService.getOtpAuthUrl(secret, user.email, 'VidaMarina UMB');
    const qrCodeUrl = TotpService.getQrCodeUrl(otpAuthUrl);

    return {
      success: true,
      secret,
      otpAuthUrl,
      qrCodeUrl
    };
  }

  async verifyAndEnable2FA(userId, secret, token) {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Usuario no encontrado.' };

    const isValid = await TotpService.verifyToken(secret, token);
    if (!isValid) {
      return { success: false, error: 'El código de 6 dígitos ingresado es incorrecto. Verifique el reloj de su teléfono y vuelva a intentar.' };
    }

    user.enable2FA(secret);

    // Si el usuario tenía una solicitud de verificación aprobada y estaba pendiente de 2FA, se promueve a Experto
    const verification = this.db.verifications.find(v => v.userId === user.id && v.isApproved());
    let promotedToExpert = false;
    if (verification && user.role !== 'Experto' && user.role !== 'Administrador') {
      this.db.promoteUserToRole(user.id, 'Experto');
      promotedToExpert = true;
    } else {
      this.db.saveUsers(this.db.users);
    }

    // Notificación de seguridad
    this.db.addNotification(
      new Notification({
        userId: user.id,
        title: '🔐 2FA Activado Satisfactoriamente',
        message: promotedToExpert
          ? 'Has configurado tu 2FA y tu rol de Experto / Investigador ha sido activado con éxito.'
          : 'La autenticación de dos factores (2FA) ha quedado habilitada para tu cuenta.',
        type: 'general'
      })
    );

    return { success: true, user, promotedToExpert };
  }

  disable2FA(userId, plainPassword) {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Usuario no encontrado.' };

    if (!user.validatePassword(plainPassword)) {
      return { success: false, error: 'Contraseña incorrecta para desactivar 2FA.' };
    }

    if (user.requires2FA()) {
      return { success: false, error: 'El rol de Administrador o Experto requiere obligatoriamente 2FA activo.' };
    }

    user.disable2FA();
    this.db.saveUsers(this.db.users);
    return { success: true, user };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthenticationService };
}
