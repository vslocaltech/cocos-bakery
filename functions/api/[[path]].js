/**
 * ============================================================================
 * COCO'S BAKERY — CLOUDFLARE PAGES FUNCTIONS API (/api/*)
 * Persistencia global en Cloudflare KV (COCOS_KV) + Auth server-side segura
 * ============================================================================
 */

const PRODUCTS_KV_KEY = 'products:v1';
const PASSWORD_KV_KEY = 'admin:password_hash';
const SESSION_COOKIE_NAME = 'cocos_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días
const MAX_PRODUCTS = 250;
const MAX_FAILED_ATTEMPTS = 5;
const FAILED_WINDOW_SECONDS = 60;

const DEFAULT_PRODUCTS = [
  {
    name: "Corazones de Azúcar & Frutilla",
    category: "Galletitas",
    tag: "Favorito",
    price: "$3.200",
    description: "Galletas de mantequilla con glaseado de vainilla, polvo de frutilla y detalles de oro comestible.",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80",
    featured: true
  },
  {
    name: "Cake de Ensueño Vintage",
    category: "Tortas",
    tag: "Más pedido",
    price: "$18.500",
    description: "Bizcochuelo de vainilla bourbon relleno de crema chantilly, frutos del bosque y decoración vintage con moños.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80",
    featured: true
  },
  {
    name: "Bocados de Cacao Real & Menta",
    category: "Dulces",
    tag: "Especial",
    price: "$4.100",
    description: "Brownies de chocolate belga intenso 70% con corazón cremoso y suave frosting de menta pastel.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80",
    featured: true
  },
  {
    name: "Cupcakes de la Hora del Té",
    category: "Dulces",
    tag: "Destacado",
    price: "$4.800",
    description: "Esponjosos cupcakes con remolino de crema de fresa, perlas de azúcar y moño rosa artesanal.",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=700&q=80",
    featured: false
  },
  {
    name: "Macarons de Pétalos de Rosa",
    category: "Galletitas",
    tag: "Edición limitada",
    price: "$5.400",
    description: "Caja de macarons franceses rellenos de ganache de chocolate blanco, agua de rosas y frambuesa.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=700&q=80",
    featured: false
  },
  {
    name: "Tarta Vintage de Frutos Dulces",
    category: "Tortas",
    tag: "Personalizable",
    price: "$16.900",
    description: "Masa sablée crocante, crema diplomata perfumada con limón y lluvia de fresas frescas con glaseado brillante.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80",
    featured: false
  }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80';
const encoder = new TextEncoder();

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      ...extraHeaders
    }
  });
}

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0) return new Uint8Array(0);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqualBytes(a, b) {
  if (a.length !== b.length) return false;
  if (typeof crypto.subtle.timingSafeEqual === 'function') {
    return crypto.subtle.timingSafeEqual(a, b);
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function sha256Bytes(text) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(String(text)));
  return new Uint8Array(digest);
}

async function derivePbkdf2(password, saltBytes, iterations = 100000) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(String(password)),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    baseKey,
    256
  );
  return new Uint8Array(bits);
}

async function hashPasswordForKv(plainPassword) {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const iterations = 100000;
  const hashBytes = await derivePbkdf2(plainPassword, saltBytes, iterations);
  return {
    salt: bytesToHex(saltBytes),
    hash: bytesToHex(hashBytes),
    iterations
  };
}

async function verifyAdminPassword(env, candidatePassword) {
  const candidate = String(candidatePassword || '');
  if (!candidate) return false;

  if (env.COCOS_KV) {
    const stored = await env.COCOS_KV.get(PASSWORD_KV_KEY, { type: 'json' });
    if (stored && stored.salt && stored.hash) {
      const saltBytes = hexToBytes(stored.salt);
      const expectedBytes = hexToBytes(stored.hash);
      const iterations = Number(stored.iterations) || 100000;
      const derived = await derivePbkdf2(candidate, saltBytes, iterations);
      return timingSafeEqualBytes(derived, expectedBytes);
    }
  }

  const configuredSecret = env.ADMIN_PASSWORD;
  if (!configuredSecret || typeof configuredSecret !== 'string') {
    return false;
  }

  const [candidateDigest, expectedDigest] = await Promise.all([
    sha256Bytes(candidate),
    sha256Bytes(configuredSecret)
  ]);
  return timingSafeEqualBytes(candidateDigest, expectedDigest);
}

async function getHmacKey(env) {
  const secret = env.SESSION_SECRET || env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('SESSION_SECRET no configurado en el servidor.');
  }
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function createSessionToken(env) {
  const nonceBytes = new Uint8Array(12);
  crypto.getRandomValues(nonceBytes);
  const payload = {
    role: 'admin',
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    n: bytesToHex(nonceBytes)
  };
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await getHmacKey(env);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const sigB64 = bytesToBase64Url(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const cookies = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const name = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      cookies[name] = val;
    }
  }
  return cookies;
}

async function verifySessionRequest(request, env) {
  try {
    const cookies = parseCookies(request);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token || !token.includes('.')) return false;

    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return false;

    const key = await getHmacKey(env);
    const sigBytes = base64UrlToBytes(sigB64);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payloadB64));
    if (!valid) return false;

    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson);
    if (!payload || payload.role !== 'admin') return false;
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return false;

    return true;
  } catch (err) {
    return false;
  }
}

function buildSessionCookie(token, request, clear = false) {
  const url = new URL(request.url);
  const isSecure = url.protocol === 'https:';
  const parts = [
    `${SESSION_COOKIE_NAME}=${clear ? '' : token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${clear ? 0 : SESSION_TTL_SECONDS}`
  ];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
}

function sanitizeProduct(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || '').trim().slice(0, 120);
  const description = String(raw.description || '').trim().slice(0, 1000);
  if (!name || !description) return null;

  const category = String(raw.category || 'Tortas').trim().slice(0, 40) || 'Tortas';
  const tag = String(raw.tag || '').trim().slice(0, 32);
  const price = String(raw.price || 'Consultar').trim().slice(0, 40) || 'Consultar';
  const imageRaw = String(raw.image || '').trim();
  const image =
    imageRaw && (imageRaw.startsWith('http://') || imageRaw.startsWith('https://') || imageRaw.startsWith('data:image/') || imageRaw.startsWith('assets/'))
      ? imageRaw
      : FALLBACK_IMAGE;

  return {
    name,
    category,
    tag,
    price,
    description,
    image,
    featured: Boolean(raw.featured)
  };
}

async function getStoredProducts(env) {
  if (!env.COCOS_KV) {
    return DEFAULT_PRODUCTS.map((p) => ({ ...p }));
  }
  const stored = await env.COCOS_KV.get(PRODUCTS_KV_KEY, { type: 'json' });
  if (stored === null) {
    return DEFAULT_PRODUCTS.map((p) => ({ ...p }));
  }
  if (Array.isArray(stored)) {
    return stored.map(sanitizeProduct).filter(Boolean);
  }
  return DEFAULT_PRODUCTS.map((p) => ({ ...p }));
}

async function checkRateLimit(request, env) {
  if (!env.COCOS_KV) return { limited: false };
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rl:login:${ip}`;
  const raw = await env.COCOS_KV.get(key);
  const count = Number(raw) || 0;
  return { limited: count >= MAX_FAILED_ATTEMPTS, count, key };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '');
  const method = request.method.toUpperCase();

  try {
    // ------------------------------------------------------------------------
    // GET /api/products — Catálogo público global desde KV
    // ------------------------------------------------------------------------
    if (pathname === '/api/products' && method === 'GET') {
      const products = await getStoredProducts(env);
      return jsonResponse({ ok: true, mode: 'cloudflare', products });
    }

    // ------------------------------------------------------------------------
    // PUT /api/products — Guardar catálogo (solo admin autenticado)
    // ------------------------------------------------------------------------
    if (pathname === '/api/products' && method === 'PUT') {
      const isAdmin = await verifySessionRequest(request, env);
      if (!isAdmin) {
        return jsonResponse({ ok: false, error: 'Sesión expirada o no autorizada. Volvé a iniciar sesión.' }, 401);
      }
      if (!env.COCOS_KV) {
        return jsonResponse({ ok: false, error: 'El almacenamiento COCOS_KV no está vinculado en Cloudflare Pages.' }, 500);
      }

      let body;
      try {
        body = await request.json();
      } catch (err) {
        return jsonResponse({ ok: false, error: 'Formato de datos inválido.' }, 400);
      }

      if (!body || !Array.isArray(body.products)) {
        return jsonResponse({ ok: false, error: 'Se esperaba una lista de productos válida.' }, 400);
      }

      if (body.products.length > MAX_PRODUCTS) {
        return jsonResponse({ ok: false, error: `Máximo permitido: ${MAX_PRODUCTS} productos.` }, 400);
      }

      const sanitized = body.products.map(sanitizeProduct).filter(Boolean);
      await env.COCOS_KV.put(PRODUCTS_KV_KEY, JSON.stringify(sanitized));
      return jsonResponse({ ok: true, products: sanitized });
    }

    // ------------------------------------------------------------------------
    // GET /api/auth/session — Verificar sesión actual
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/session' && method === 'GET') {
      const authenticated = await verifySessionRequest(request, env);
      return jsonResponse({ ok: true, mode: 'cloudflare', authenticated });
    }

    // ------------------------------------------------------------------------
    // POST /api/auth/login — Validar clave en el servidor y emitir cookie HttpOnly
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/login' && method === 'POST') {
      const rl = await checkRateLimit(request, env);
      if (rl.limited) {
        return jsonResponse(
          { ok: false, error: 'Demasiados intentos fallidos. Esperá un minuto antes de reintentar.' },
          429
        );
      }

      let body;
      try {
        body = await request.json();
      } catch (err) {
        return jsonResponse({ ok: false, error: 'Solicitud inválida.' }, 400);
      }

      const password = String(body?.password || '').trim();
      const valid = await verifyAdminPassword(env, password);

      if (!valid) {
        if (env.COCOS_KV && rl.key) {
          await env.COCOS_KV.put(rl.key, String((rl.count || 0) + 1), {
            expirationTtl: FAILED_WINDOW_SECONDS
          });
        }
        return jsonResponse({ ok: false, error: 'Clave incorrecta. Intentá nuevamente.' }, 401);
      }

      if (env.COCOS_KV && rl.key && rl.count > 0) {
        await env.COCOS_KV.delete(rl.key);
      }

      const token = await createSessionToken(env);
      return jsonResponse(
        { ok: true, authenticated: true },
        200,
        { 'Set-Cookie': buildSessionCookie(token, request, false) }
      );
    }

    // ------------------------------------------------------------------------
    // POST /api/auth/logout — Cerrar sesión
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/logout' && method === 'POST') {
      return jsonResponse(
        { ok: true, authenticated: false },
        200,
        { 'Set-Cookie': buildSessionCookie('', request, true) }
      );
    }

    // ------------------------------------------------------------------------
    // POST /api/auth/password — Cambiar contraseña (guardada en KV con PBKDF2)
    // ------------------------------------------------------------------------
    if (pathname === '/api/auth/password' && method === 'POST') {
      const isAdmin = await verifySessionRequest(request, env);
      if (!isAdmin) {
        return jsonResponse({ ok: false, error: 'Sesión expirada o no autorizada.' }, 401);
      }
      if (!env.COCOS_KV) {
        return jsonResponse({ ok: false, error: 'El almacenamiento COCOS_KV no está vinculado.' }, 500);
      }

      let body;
      try {
        body = await request.json();
      } catch (err) {
        return jsonResponse({ ok: false, error: 'Solicitud inválida.' }, 400);
      }

      const currentPassword = String(body?.currentPassword || '').trim();
      const newPassword = String(body?.newPassword || '').trim();

      if (newPassword.length < 6 || newPassword.length > 128) {
        return jsonResponse({ ok: false, error: 'La nueva clave debe tener entre 6 y 128 caracteres.' }, 400);
      }

      const currentValid = await verifyAdminPassword(env, currentPassword);
      if (!currentValid) {
        return jsonResponse({ ok: false, error: 'La clave actual es incorrecta.' }, 400);
      }

      const hashedRecord = await hashPasswordForKv(newPassword);
      await env.COCOS_KV.put(PASSWORD_KV_KEY, JSON.stringify(hashedRecord));

      const freshToken = await createSessionToken(env);
      return jsonResponse(
        { ok: true },
        200,
        { 'Set-Cookie': buildSessionCookie(freshToken, request, false) }
      );
    }

    return jsonResponse({ ok: false, error: 'Endpoint no encontrado.' }, 404);
  } catch (err) {
    console.error('API error:', err);
    return jsonResponse({ ok: false, error: 'Error interno del servidor.' }, 500);
  }
}
