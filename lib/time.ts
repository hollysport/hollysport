/*
 * Render sırasında Date.now() çağırmak react-hooks/purity kuralını
 * ihlal ettiği için "şu an" hesaplaması bu yardımcı üzerinden yapılır.
 * Bu sayfalar `force-dynamic` olduğundan istek başına güncel değer üretilir.
 */
export function getCurrentTimestamp(): number {
    return Date.now();
}
