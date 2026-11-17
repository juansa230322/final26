/**
 * ================================================================
 * SERVICIO: SupabaseService (Persistencia en la Nube y Backend as a Service)
 * ================================================================
 * Encapsula la conexión a Supabase:
 * - Supabase Database (PostgreSQL)
 * - Supabase Authentication
 * - Supabase Storage (Fotos y Documentos)
 * - Supabase Realtime (Comentarios y Alertas)
 * - Row Level Security (RLS)
 */
class SupabaseService {
  static instance = null;

  constructor() {
    if (SupabaseService.instance) {
      return SupabaseService.instance;
    }
    this.client = null;
    this.config = this.loadConfig();
    this.initClient();
    SupabaseService.instance = this;
  }

  static getInstance() {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  loadConfig() {
    const savedUrl = (typeof localStorage !== 'undefined' && localStorage.getItem('VM_SUPABASE_URL')) || '';
    const savedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('VM_SUPABASE_ANON_KEY')) || '';
    const globalUrl = typeof window !== 'undefined' ? (window.SUPABASE_URL || '') : '';
    const globalKey = typeof window !== 'undefined' ? (window.SUPABASE_ANON_KEY || '') : '';

    return {
      url: savedUrl || globalUrl,
      anonKey: savedKey || globalKey
    };
  }

  saveConfig(url, anonKey) {
    this.config.url = (url || '').trim();
    this.config.anonKey = (anonKey || '').trim();
    if (typeof localStorage !== 'undefined') {
      if (this.config.url) localStorage.setItem('VM_SUPABASE_URL', this.config.url);
      else localStorage.removeItem('VM_SUPABASE_URL');

      if (this.config.anonKey) localStorage.setItem('VM_SUPABASE_ANON_KEY', this.config.anonKey);
      else localStorage.removeItem('VM_SUPABASE_ANON_KEY');
    }
    this.initClient();
    return this.isConfigured();
  }

  initClient() {
    if (this.config.url && this.config.anonKey) {
      try {
        if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
          this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
          console.log('✓ Cliente de Supabase inicializado correctamente.');
          return true;
        }
      } catch (err) {
        console.warn('Advertencia al inicializar cliente Supabase:', err);
      }
    }
    this.client = null;
    return false;
  }

  isConfigured() {
    return Boolean(this.client && this.config.url && this.config.anonKey);
  }

  // ==================== SUPABASE AUTH ====================
  async signUp(email, password, metadata = {}) {
    if (!this.isConfigured()) return { user: null, error: 'Supabase no configurado' };
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { user: null, error: err.message };
    }
  }

  async signIn(email, password) {
    if (!this.isConfigured()) return { user: null, error: 'Supabase no configurado' };
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { user: null, error: err.message };
    }
  }

  async signOut() {
    if (!this.isConfigured()) return;
    try {
      await this.client.auth.signOut();
    } catch (e) {}
  }

  // ==================== SUPABASE STORAGE ====================
  async uploadFile(bucketName, path, fileBlob) {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client.storage.from(bucketName).upload(path, fileBlob, {
        cacheControl: '3600',
        upsert: true
      });
      if (error) throw error;

      const { data: publicData } = this.client.storage.from(bucketName).getPublicUrl(path);
      return publicData ? publicData.publicUrl : null;
    } catch (err) {
      console.error(`Error subiendo archivo a bucket ${bucketName}:`, err);
      return null;
    }
  }

  // ==================== SUPABASE DATABASE CRUD ====================
  async fetchTable(tableName, selectQuery = '*') {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client.from(tableName).select(selectQuery);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`Error leyendo tabla Supabase [${tableName}]:`, err.message);
      return null;
    }
  }

  async insertRecord(tableName, record) {
    if (!this.isConfigured()) return null;
    try {
      const { data, error } = await this.client.from(tableName).insert([record]).select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.warn(`Error insertando en Supabase [${tableName}]:`, err.message);
      return null;
    }
  }

  async updateRecord(tableName, matchCriteria, updates) {
    if (!this.isConfigured()) return null;
    try {
      let query = this.client.from(tableName).update(updates);
      for (const [key, value] of Object.entries(matchCriteria)) {
        query = query.eq(key, value);
      }
      const { data, error } = await query.select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`Error actualizando en Supabase [${tableName}]:`, err.message);
      return null;
    }
  }

  async deleteRecord(tableName, matchCriteria) {
    if (!this.isConfigured()) return false;
    try {
      let query = this.client.from(tableName).delete();
      for (const [key, value] of Object.entries(matchCriteria)) {
        query = query.eq(key, value);
      }
      const { error } = await query;
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn(`Error eliminando en Supabase [${tableName}]:`, err.message);
      return false;
    }
  }

  // ==================== SUPABASE REALTIME ====================
  subscribeToChanges(tableName, onInsertCallback, onUpdateCallback, onDeleteCallback) {
    if (!this.isConfigured()) return null;
    try {
      const channel = this.client
        .channel(`public:${tableName}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tableName }, (payload) => {
          if (onInsertCallback) onInsertCallback(payload.new);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName }, (payload) => {
          if (onUpdateCallback) onUpdateCallback(payload.new);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: tableName }, (payload) => {
          if (onDeleteCallback) onDeleteCallback(payload.old);
        })
        .subscribe();
      return channel;
    } catch (e) {
      return null;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SupabaseService };
}
