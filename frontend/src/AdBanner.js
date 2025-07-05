export default function AdBanner() {
  // Варианты: вставь сюда код от партнёров (Ozon, WB, Яндекс) или просто картинку со ссылкой.
  return (
    <div style={{
      width: "100vw", maxWidth: 480, margin: "0 auto",
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#fff", textAlign: "center", padding: 8, zIndex: 100
    }}>
      {/* Пример баннера */}
      <a href="https://www.ozon.ru/" target="_blank" rel="noopener noreferrer">
        <img src="https://ir.ozone.ru/s3/cms/filer_public/8a/2b/8a2b56c9-4b1f-4269-83b7-23ac690d937c/banner_ozon.jpg"
          alt="Ozon" style={{ maxHeight: 48, borderRadius: 8 }} />
      </a>
    </div>
  );
}
