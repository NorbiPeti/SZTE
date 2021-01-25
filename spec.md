---
title: SZTE infós kreditszámoló
ptitle: Kreditek
---

Ez az oldal segít kiszámítani (az egyes specializációkhoz is) már megszerzett krediteket, és ellenőrizni egyéb feltételeket.

*A megadott adatok a gépeden maradnak, azokat nem kapom meg.
Az eredmények pontosságáért felelősséget nem vállalok, hiteles tájékoztatásért fordulj a TO-hoz.*

## 1. Válaszd ki a képzést

*Jelenleg csak a proginfó támogatott.*

<label>
Képzés:
<select style="color: black" id="szak">
    <option style="color: black" value="nope">---- Szakok ----</option>
    <option style="color: black" value="gai" disabled>gazdaságinformatikus</option>
    <option style="color: black" selected value="pti">programtervező informatikus</option> <!-- TODO -->
    <option style="color: black" value="mei" disabled>mérnökinformatikus</option>
</select>
</label>
<span id="szakError" style="color: red"></span>

## 2. Neptun leckekönyv export
Szükség lesz a Neptunban a Tanulmányok -> Leckekönyv -> Minden félév -> XLS export (ikon jobb oldalt) eredményére.

<input type="file" id="leckekonyv" accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />

## 3. Teljesítések:
<span id="specs"></span>

A szükségeseken felül teljesitett kreditek átszámolódnak az egyéb kötvál és a szabvál kategóriákba. Ez az oldal nem tárgyanként számitja át, igy lehetséges néhány kredit eltérés.

<script src="xlsx.full.min.js"></script>
<script src="papaparse.min.js"></script>
<script src="specdata.js"></script>
<script src="spec.js"></script>
