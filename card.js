// var rezept_name = localStorage.getItem("Name");
// var zutaten = localStorage.getItem('Zutaten');
// var beschreibung = localStorage.getItem('Beschreibung');
// var encodedImage = localStorage.getItem('image');

function fillData(rezept_name, zutaten, beschreibung, encodedImage) {
  document.getElementById("name_recipe").innerHTML = rezept_name;
  var aufgeteilteZutaten = splitZutaten(zutaten);
  var aufgeteilteAnweisung = splitAnweisung(beschreibung);
  if (encodedImage) {
    document.getElementById("stored-image").src = encodedImage;
  } else {
    // falls kein Bild vorhanden: ImageDiv nicht anzeigen
    document.getElementById("imageDiv").style.display = "none";
  }

  var ready = match(aufgeteilteZutaten, aufgeteilteAnweisung);
  console.log(ready);
  creatRecipeTable(ready);
}

// ***************************************
// Basic Flow

function splitZutaten(Zutaten) {
  //  Aus einem String eine Zutatenliste machen
  //  ===========================================
  /*
          "5g Orangen
          4g Apfel
          500g Mehl"
  */
  // | Zutat  | quantity | unit | Reihenfolge  |
  // | ------ | -------- | ---- | ------------ |
  // | Orange | 5        | g    | 0            |
  // | Apfel  | 4        | g    | 1            |
  // | Mehl   | 500      | g    | 2            |

  // Falls Eingabe Leer -> Leerzeichen
  if (!Zutaten) {
    Zutaten = " ";
  }

  var zutatensplit = new Array();

  // Doppelleerzeichen & mehr werden auf 1 reduziert
  const regex = / {2,}/gm;
  Zutaten = Zutaten.replace(regex, " ");

  // Leerzeilen und Zeilen mit ausschließlich Leerzeichen werden gekürzt
  const regex_a = /^\n|^ +\n|^ /gm;
  Zutaten = Zutaten.replace(regex_a, "");

  // Zerteile Zeilen am Zeilenumbruch, loop über alle Zeilen einzeln
  // Linux uses \n for a new-line, Windows \r\n and old Macs \r
  var regex_break = /[\r\n]+/g;
  var lines = Zutaten.split(regex_break);

  for (var x = 0; x < lines.length; x++) {
    if (lines[x] === "") {
      // skippt die letzte Leerezeile
    } else {
      // Suche Zahlen
      var regex_numbers = /\d+(?:,|\.)?\d*/gm;
      var quantity = lines[x].match(regex_numbers);
      if (quantity === null) {
        quantity = 0;
      } else {
        quantity = quantity[0];
        lines[x] = lines[x].replace(regex_numbers, ``);
      }

      // Sucht Unit
      const regex_units =
        /^ ?(?:Becher|Bund|c|cl|cm|cup|dl|dl|Dose|EL|el|etwas|fl|fl|g|g|g|gal|gehäuft|groß|h|in|inch|k|kg|kl|kleine|l|lb|Liter|m|m|ml|mm|ounce|oz|oz|p|Packung|Pck|pound|Prise|pt|Scheibe|spritzer|st|Stange|t|Tasse|TL|tsp|wenig|Zehe|zehe|Zehen|zehen|Zweig|zweig|Zweige|zweige|rote|Rote|Gelbe|gelbe|Blaue|blaue|Grüne|grüne|orange|Orange).? /i;
      var unit = lines[x].match(regex_units);
      if (unit === null) {
        unit = " ";
      } else {
        unit = unit[0];
        lines[x] = lines[x].replace(regex_units, ``);
      }

      //Restlicher String von Zeilenumbrüchen etc. bereinigen
      var regex_rest = /\n|\r|\t|^ /g;
      lines[x] = lines[x].replace(regex_rest, ``);

      // Füge alles zusammen
      var all = new Array();
      all.push(lines[x]);
      all.push(quantity);
      all.push(unit);
      all.push(x); // Reihenfolge

      zutatensplit.push(all);
    }
  }

  // Clear doppelte

  // function unique(arr) {
  //   var result = new Array();
  //   result.push(arr[0]);

  //   for (let zeile = 0; zeile < arr.length; zeile++) {
  //     for (let b = 0; b < result.length; b++) {
  //       if (result[b][0] === arr[zeile][0]) {
  //         // Abbruch wenn gleiche Zutat gefunden
  //         break;
  //       } else if (b === result.length - 1) {
  //         // wenn result komplet überprüft wurde und es zu keinen abruch kam
  //         result.push(arr[zeile]);
  //         break;
  //       }
  //     }
  //   }
  //   return result;
  // }

  // // Falls Zutaten leer gelasen werden kann die funktion unique nicht arbeiten
  // if (zutatensplit != "") {
  //   var final = unique(zutatensplit);
  // } else {
  //   final = zutatensplit;
  // }

  final = zutatensplit;

  return final;
}

function splitAnweisung(anweisungen) {
  // Falls Eingabe Leer -> Leerzeichen
  if (!anweisungen) {
    anweisungen = " ";
  }

  var final = new Array();

  // Doppelleerzeichen & mehr werden auf 1 reduziert
  const regex = / {2,}/gm;
  anweisungen = anweisungen.replace(regex, " ");

  // Leerzeilen und Zeilen mit ausschließlich Leerzeichen werden gekürzt
  const regex_a = /^\n|^ +\n|^ /gm;
  anweisungen = anweisungen.replace(regex_a, "");

  // Entfernen aller Zeilenumbrüche
  const regex_b = /\n/gm;
  anweisungen = anweisungen.replace(regex_b, "");

  // Zerteile Zeilen am "." , loop über alle zeilen einzeln
  // Außnahme Zahlenangaben mit Puntk 1.5 0.5
  // oder ca. min. ...
  var regex_break = /(?<!ca|min)\.(?!\d)/gm;
  var lines = anweisungen.split(regex_break);

  // Leerzeilen (falls mehrere Punkte da sind bzw. die letzte Zeile) werden gekürzt
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] === "") {
      lines.splice(i, 1);
      i--;
    }
  }

  return lines;
}

function match(ZutatenString, AnweisungsString) {
  // erstellt ein array nach dem Muster
  // 0 Zutat
  // 1 Zugehörige Anweisung
  // 2 Zutat
  // 3 Zugehörige Anweisung
  // ...
  // x leer
  // y array mit Zutaten arrays
  // z leer

  var aufgeteilteZutaten = ZutatenString;
  var aufgeteilteAnweisung = AnweisungsString;
  var anweisungsArry = new Array();

  for (let y = 0; y < aufgeteilteAnweisung.length; y++) {
    var neueZeile = new Array();

    for (var x = 0; x < aufgeteilteZutaten.length; x++) {
      var regEx_dyn = new RegExp(aufgeteilteZutaten[x][0], "i");
      let result = aufgeteilteAnweisung[y].match(regEx_dyn);

      if (result != null) {
        neueZeile.push(aufgeteilteZutaten[x]); // Zutaten bei Treffer Sammeln
        aufgeteilteZutaten.splice([x], 1);
        x = -1; // damit das array von vorne läuft
      }
    }
    anweisungsArry.push(neueZeile);
    anweisungsArry.push(aufgeteilteAnweisung[y]);
  }

  // Wenn Zutaten bei der letzten Runde über bleiben:

  if (aufgeteilteZutaten.length != 0) {
    anweisungsArry.push(aufgeteilteZutaten);
    anweisungsArry.push("");
  }

  return anweisungsArry;
}

function creatRecipeTable(recipeData) {
  var table = document.getElementById("table_Zutaten");
  var tableBody = document.getElementById("table_Zutaten_Body");

  for (let index = 0; index < recipeData.length; index++) {
    var zutatenCounter;

    if (Array.isArray(recipeData[index])) {
      zutatenCounter = recipeData[index].length;

      let isFirstIteration = true;

      // Bei null Zaten wird eine Zeile erstellt in der die ersten 4 Spalten leer bleiben
      if (zutatenCounter === 0) {
        // Nur eine Anweisungszeile
        var row = document.createElement("tr");

        // Definition der Zellen
        // ***********************
        var cell_Zutat = document.createElement("td");
        cell_Zutat.classList.add("px-4", "text-right");

        var cell_Menge = document.createElement("td");
        cell_Menge.classList.add("text-right");

        var cell_Einheit = document.createElement("td");
        cell_Einheit.classList.add("text-left");

        var cell_Anweisung = document.createElement("td");
        cell_Anweisung.classList.add(
          "px-6",
          "py-2",
          "w-96",
          "text-left",
          "text-sm",
          "align-middle"
        );
        // ***********************

        cell_Zutat.appendChild(document.createTextNode(""));
        cell_Menge.appendChild(document.createTextNode(""));
        cell_Einheit.appendChild(document.createTextNode(""));

        // + Anweisung
        var rowspanValue = 1;
        index++;

        cell_Anweisung.setAttribute("rowspan", rowspanValue);
        cell_Anweisung.appendChild(
          document.createTextNode(recipeData[index] + ".")
        );

        row.appendChild(cell_Zutat);
        row.appendChild(cell_Menge);
        row.appendChild(cell_Einheit);
        row.appendChild(cell_Anweisung);
        tableBody.appendChild(row);
        index--; // sonst werden Zeilen Übersprungen
      }
      // Bei >null Zaten wird normale Zeile erstellt und nur beim ersten durchlauf die Anweisung hinzugefügt
      else {
        recipeData[index].forEach((zutaten) => {
          var row = document.createElement("tr");

          // Definition der Zellen
          // ***********************
          var cell_Zutat = document.createElement("td");
          cell_Zutat.classList.add("px-4", "text-right");

          var cell_Menge = document.createElement("td");
          cell_Menge.classList.add("text-right");

          var cell_Einheit = document.createElement("td");
          cell_Einheit.classList.add("text-left");

          var cell_Anweisung = document.createElement("td");
          cell_Anweisung.classList.add(
            "px-6",
            "py-2",
            "w-96",
            "text-left",
            "text-sm",
            "align-middle"
          );
          // ***********************

          cell_Zutat.appendChild(document.createTextNode(zutaten[0]));
          cell_Menge.appendChild(document.createTextNode(zutaten[1]));
          cell_Einheit.appendChild(document.createTextNode(zutaten[2]));

          row.appendChild(cell_Zutat);
          row.appendChild(cell_Menge);
          row.appendChild(cell_Einheit);

          if (isFirstIteration) {
            // + Anweisung
            var rowspanValue = zutatenCounter;
            index++;

            cell_Anweisung.setAttribute("rowspan", rowspanValue);
            if (recipeData[index] != "") {
              cell_Anweisung.appendChild(
                document.createTextNode(recipeData[index] + ".")
              );
            } else {
              cell_Anweisung.appendChild(
                document.createTextNode(recipeData[index])
              );
            }

            row.appendChild(cell_Anweisung);
            index--; // sonst werden Zeilen Übersprungen
            isFirstIteration = false;
          }
          tableBody.appendChild(row);
        });
      }
    }
  }
  table.appendChild(tableBody);
}

// ***************************************
// img

const imgElement = document.getElementById("stored-image");
let isDragging = false;
let startingX;
let startingY;
let xOffset = 0;
let yOffset = 0;
let zoomFactor = 1;

imgElement.addEventListener("mousedown", (event) => {
  isDragging = true;
  startingX = event.clientX - xOffset;
  startingY = event.clientY - yOffset;
});

imgElement.addEventListener("mouseup", () => {
  isDragging = false;
});

imgElement.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const currentX = event.clientX - startingX;
    const currentY = event.clientY - startingY;
    xOffset = currentX;
    yOffset = currentY;
    imgElement.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${zoomFactor})`;
  }
});

imgElement.addEventListener("wheel", (event) => {
  if (event.ctrlKey) {
    event.preventDefault();
    zoomFactor += event.deltaY * -0.0005;
    zoomFactor = Math.max(0.1, zoomFactor);
    imgElement.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${zoomFactor})`;
  }
});

// **********************************************************************
// Änderungen zurückspielen

const name_recipe = document.getElementById("name_recipe");

name_recipe.addEventListener("input", (event) => {
  var data = event.target;
  var newName = data.innerHTML;
  localStorage.setItem("Name", newName);
});

var table = document.getElementById("table_Zutaten");
table.addEventListener("input", function () {
  var rows = table.rows;
  var zutaten = "";
  var anweisung = "";

  for (var i = 1; i < rows.length; i++) {
    var cells = rows[i].cells;
    var zutatenCell = cells[1];
    var mengeCell = cells[2];
    var einheitCell = cells[0];
    var anweisungCell = cells[3];
    var rowspan = parseInt(zutatenCell.getAttribute("rowspan")) || 1;

    // Skip the next rows with the same zutaten cell
    if (rowspan > 1) {
      i += rowspan - 1;
    }

    // Add the cells to the output
    if (zutatenCell) {
      zutaten +=
        [zutatenCell, mengeCell, einheitCell]
          .filter((cell) => cell)
          .map((cell) => cell.textContent.trim())
          .join(" ") + "\n";
    }

    if (anweisungCell) {
      anweisung += anweisungCell.textContent.trim() + "\n";
    }
  }

  // console.log("Zutaten: " + zutaten);
  // console.log("Anweisung: " + anweisung);
  saveChanges(zutaten, anweisung);
});
function saveChanges(zutaten, beschreibung) {
  localStorage.setItem("Zutaten", zutaten);
  localStorage.setItem("Beschreibung", beschreibung);
}

//Blur wird erst ausgelößt wenn man aus der Tabelle klickt
table.addEventListener("blur", reload);
function reload() {
  var zutaten = localStorage.getItem("Zutaten");
  var beschreibung = localStorage.getItem("Beschreibung");

  var aufgeteilteZutaten = splitZutaten(zutaten);
  var aufgeteilteAnweisung = splitAnweisung(beschreibung);

  var ready = match(aufgeteilteZutaten, aufgeteilteAnweisung);
  console.log("new:" + ready);
  var tableBody = document.getElementById("table_Zutaten_Body");
  tableBody.innerHTML = "";
  creatRecipeTable(ready);
}
