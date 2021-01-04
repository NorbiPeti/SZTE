---
title: SZTE specializációk
ptitle: Specializációk követelményei
---

Ez az oldal segít kiszámítani az egyes specializációkhoz már megszerzett krediteket, és egyéb feltételeket.

*A megadott adatok a gépeden maradnak, azokat nem kapom meg.
Az adatok tájékoztató jellegűek, a kiírt eredményekért felelősséget nem vállalok.*

## 1. Válaszd ki a képzést

<label>
Képzés:
<select style="color: black" id="szak">
    <option selected value="nope">---- Szakok ----</option>
    <option value="gi">gazdaságinformatikus</option>
    <option value="pti">programtervező informatikus</option>
    <option value="mi">mérnökinformatikus</option>
</select>
</label>
<span id="szakError" style="color: red"></span>

## 2. Neptun leckekönyv export
Szükség lesz a Neptunban a Tanulmányok -> Leckekönyv -> Minden félév -> XLS export (ikon jobb oldalt) eredményére.

<input type="file" id="leckekonyv" accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />

## 3. Teljesítések:
<span id="specs"></span>

<script src="xlsx.full.min.js"></script>
<script src="papaparse.min.js"></script>
<script src="specdata.js"></script>
<script src="spec.js"></script>
