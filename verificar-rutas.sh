#!/bin/bash
# Verifica que cada archivo que usa la presentación exista con el nombre EXACTO.
# GitHub Pages distingue mayúsculas y minúsculas; tu Mac no, por eso un error acá no se nota hasta publicar.
# Uso: abrí la Terminal en esta carpeta y ejecutá:  bash verificar-rutas.sh
cd "$(dirname "$0")" || exit 1
falta=0

chequear() {
    dir=$(dirname "$1"); nombre=$(basename "$1")
    if ls -1 "$dir" 2>/dev/null | grep -Fxq "$nombre"; then
        echo "OK     $1"
    else
        echo "FALTA  $1"; falta=1
    fi
}

for f in index.html style.css script.js \
    fonts/UniversLight.ttf fonts/UniversRegular.ttf fonts/UniversBold.ttf \
    assets/logo-unicef-blanco.svg assets/logo-unicef-azul.svg assets/logo-fagran.svg assets/logo-cispan.svg \
    assets/portada-caja.png assets/Portada-2.1.1.png assets/Slide_5_Indice.png \
    assets/foto-completa-herramienta.png assets/qr-documento.png; do
    chequear "$f"
done
for i in 1 2 3 4 5 6 7; do chequear "assets/Portada-2.$i.png"; done

echo
if [ $falta -eq 0 ]; then echo "Todo en orden: podés publicar."; else echo "Hay archivos con otro nombre o ausentes (revisá mayúsculas, guiones y extensión)."; fi
