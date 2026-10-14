// ========================================================
// Diccionario Semántico y Relación de Palabras con Trabajos
// Proyecto: Échele Camello
// ========================================================

export interface KeywordCategoryMapping {
  categoryId: string;
  categoryName: string;
  tradeNames: string[];
  keywords: string[];
}

export const SEMANTIC_WORK_DICTIONARY: KeywordCategoryMapping[] = [
  {
    categoryId: 'carpinteria',
    categoryName: 'Carpintería',
    tradeNames: ['Carpintero', 'Maestro Carpintero', 'Ebanista', 'Instalador de Muebles'],
    keywords: [
      'madera', 'maderas', 'mueble', 'muebles', 'closet', 'closets', 'armario', 'armarios',
      'puerta', 'puertas', 'marco', 'marcos', 'repisa', 'repisas', 'estante', 'estantes',
      'mesa', 'mesas', 'silla', 'sillas', 'cajon', 'cajón', 'cajones', 'bisagra', 'bisagras',
      'chapa de madera', 'lacado', 'lacados', 'barniz', 'barnizado', 'formica', 'fórmica',
      'melamina', 'mdf', 'aglomerado', 'pino', 'cedro', 'roble', 'aserrin', 'aserrín',
      'cepillado', 'cepillar', 'cocina integral', 'modular', 'modulares', 'carpinteria', 'carpintería'
    ]
  },
  {
    categoryId: 'plomeria',
    categoryName: 'Plomería',
    tradeNames: ['Plomero', 'Maestro Plomero', 'Fontanero', 'Técnico Hidrosanitario'],
    keywords: [
      'agua', 'aguas', 'fuga', 'fugas', 'tubo', 'tubos', 'tuberia', 'tubería', 'tuberias', 'tuberías',
      'grifo', 'grifos', 'griferia', 'grifería', 'llave de paso', 'lavamanos', 'lavaplatos',
      'inodoro', 'inodoros', 'sanitario', 'sanitarios', 'bano', 'baño', 'baños', 'sifon', 'sifón',
      'sifones', 'gotera', 'goteras', 'filtracion', 'filtración', 'filtraciones', 'humedad', 'humedades',
      'destape', 'destapes', 'caneria', 'cañería', 'cañerias', 'desague', 'desagüe', 'desagues',
      'calentador', 'calentadores', 'bosch', 'haceb', 'valvula', 'válvula', 'valvulas', 'empaque',
      'empaques', 'bomba de agua', 'tanque', 'cobre', 'pvc', 'presion de agua', 'plomero', 'plomeria', 'plomería'
    ]
  },
  {
    categoryId: 'electricidad',
    categoryName: 'Electricidad',
    tradeNames: ['Electricista', 'Técnico Electricista', 'Instalador Eléctrico', 'CONTE'],
    keywords: [
      'luz', 'luces', 'cable', 'cables', 'cableado', 'taco', 'tacos', 'breaker', 'breakers',
      'caja de tacos', 'fusible', 'fusibles', 'corriente', 'toma', 'tomas', 'tomacorriente',
      'enchufe', 'enchufes', 'interruptor', 'interruptores', 'lampara', 'lámpara', 'lamparas',
      'bombillo', 'bombillos', 'bombillo led', 'luminaria', 'luminarias', 'corto', 'cortocircuito',
      'cortocircuitos', 'chispa', 'chispas', 'recalentado', 'quemado', 'quemo', 'voltaje', '110v',
      '220v', 'apagon', 'apagón', 'acometida', 'polo a tierra', 'sobrecarga', 'conte', 'electricista',
      'electricidad', 'timbre', 'multimetro'
    ]
  },
  {
    categoryId: 'pintura',
    categoryName: 'Pintura',
    tradeNames: ['Pintor', 'Maestro Pintor', 'Estucador', 'Acabados'],
    keywords: [
      'pintar', 'pintura', 'pinturas', 'brocha', 'brochas', 'rodillo', 'rodillos', 'estuco',
      'estucos', 'estucado', 'resane', 'resanes', 'resanar', 'grieta', 'grietas', 'fachada',
      'fachadas', 'color', 'colores', 'vinilo', 'vinilo tipo 1', 'esmalte', 'acabado', 'acabados',
      'salitre', 'mancha', 'manchas', 'humedades en pared', 'techo', 'techos', 'cielo raso',
      'pared', 'paredes', 'mural', 'estuco plastico', 'estuco veneciano', 'pintor', 'impermeabilizante',
      'impermeabilizar', 'impermeabilizacion', 'impermeabilización'
    ]
  },
  {
    categoryId: 'aseo',
    categoryName: 'Aseo y Desinfección',
    tradeNames: ['Especialista en Aseo', 'Personal de Limpieza', 'Aseadora', 'Desinfección'],
    keywords: [
      'limpieza', 'aseo', 'desinfeccion', 'desinfección', 'limpiar', 'lavar', 'lavado',
      'grasa', 'desengrasar', 'desengrase', 'polvo', 'sucio', 'suciedad', 'mugre', 'tapete',
      'tapetes', 'alfombra', 'alfombras', 'vidrio', 'vidrios', 'ventana', 'ventanas',
      'post-remodelacion', 'post remodelacion', 'remodelacion', 'remodelación', 'organizar',
      'closets desordenados', 'alacena', 'cocina sucia', 'bano sucio', 'desinfectar', 'ecologico',
      'jornada de aseo', 'aseadora', 'empleada domestica'
    ]
  },
  {
    categoryId: 'cerrajeria',
    categoryName: 'Cerrajería',
    tradeNames: ['Cerrajero', 'Técnico Cerrajero', 'Cerrajería 24/7'],
    keywords: [
      'chapa', 'chapas', 'llave', 'llaves', 'cerradura', 'cerraduras', 'candado', 'candados',
      'cerrojo', 'cerrojos', 'cilindro', 'cilindros', 'guarda', 'guardas', 'traba', 'trabada',
      'puerta trabada', 'abrir puerta', 'apertura', 'duplicado', 'copia de llave', 'cerrajero',
      'cerrajeria', 'cerrajería', 'yale', 'cisa', 'schlage', 'cerradura digital', 'cerradura inteligente',
      'pasador', 'cerrojo de seguridad', 'pestillo'
    ]
  }
];

/**
 * Normaliza un texto removiendo tildes, signos de puntuación y espacios extras
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/[^\w\s]/gi, ' ') // Quita puntuación
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Encuentra categorías semánticamente relacionadas con la búsqueda del usuario
 * Ejemplo: "madera" -> ['carpinteria']
 * Ejemplo: "fuga de agua" -> ['plomeria']
 * Ejemplo: "se saltó el taco" -> ['electricidad']
 */
export function getSemanticRelatedCategories(query: string): KeywordCategoryMapping[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const queryWords = normalizedQuery.split(' ').filter((w) => w.length > 2);
  const matchedCategories = new Set<KeywordCategoryMapping>();

  for (const item of SEMANTIC_WORK_DICTIONARY) {
    // 1. Coincidencia directa con el nombre o id de la categoría
    if (
      normalizeText(item.categoryId).includes(normalizedQuery) ||
      normalizeText(item.categoryName).includes(normalizedQuery) ||
      item.tradeNames.some((t) => normalizeText(t).includes(normalizedQuery))
    ) {
      matchedCategories.add(item);
      continue;
    }

    // 2. Coincidencia de palabras clave individuales o frases
    for (const kw of item.keywords) {
      const normalizedKw = normalizeText(kw);
      // Coincidencia exacta o contenida en el término de búsqueda
      if (normalizedQuery.includes(normalizedKw) || normalizedKw.includes(normalizedQuery)) {
        matchedCategories.add(item);
        break;
      }
      // Coincidencia por tokens/palabras
      if (queryWords.some((w) => normalizedKw === w || (w.length >= 4 && normalizedKw.includes(w)))) {
        matchedCategories.add(item);
        break;
      }
    }
  }

  return Array.from(matchedCategories);
}

/**
 * Evalúa si una entidad (trabajador o solicitud) coincide con la consulta usando el diccionario semántico
 */
export function matchesSemanticSearch(
  query: string,
  targetFields: (string | undefined)[],
  targetCategoryId?: string,
  targetCategoryName?: string
): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  // 1. Búsqueda literal directa en los campos de texto
  for (const field of targetFields) {
    if (field && normalizeText(field).includes(normalizedQuery)) {
      return true;
    }
  }

  // 2. Búsqueda semántica usando el diccionario de palabras asociadas
  const relatedCategories = getSemanticRelatedCategories(query);
  if (relatedCategories.length > 0) {
    for (const cat of relatedCategories) {
      // Coincidencia por ID de categoría
      if (targetCategoryId && normalizeText(targetCategoryId) === normalizeText(cat.categoryId)) {
        return true;
      }
      // Coincidencia por Nombre de categoría
      if (targetCategoryName && normalizeText(targetCategoryName).includes(normalizeText(cat.categoryName))) {
        return true;
      }
      // Coincidencia en alguno de los campos de texto con los nombres de oficio o categoría
      for (const trade of cat.tradeNames) {
        if (targetFields.some((f) => f && normalizeText(f).includes(normalizeText(trade)))) {
          return true;
        }
      }
    }
  }

  // 3. Comprobación de palabras compuestas (todas las palabras deben coincidir)
  const queryWords = normalizedQuery.split(' ').filter((w) => w.length > 2);
  if (queryWords.length > 1) {
    const allFieldsCombined = normalizeText(targetFields.filter(Boolean).join(' '));
    const allWordsMatch = queryWords.every((word) => allFieldsCombined.includes(word));
    if (allWordsMatch) return true;
  }

  return false;
}
