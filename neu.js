function getData(form) {
  var formData = new FormData(form);
  var rezeptObjekt = Object.fromEntries(formData);

  console.log(formData);

  localStorage.setItem("Name", rezeptObjekt.Name);
  localStorage.setItem("Zutaten", rezeptObjekt.Zutaten);
  localStorage.setItem("Beschreibung", rezeptObjekt.Beschreibung);
}

function seitenWechsel(Ziel) {
  window.location.href = Ziel;
}

function testdata() {
  var name = `Maultaschen-Pfanne`;
  var beschreibung = `Maultaschen in kochendem Salzwasser 3-4 Minuten erhitzen, abgießen. 
Champignons, Paprikaschoten und Porree waschen und in Streifen schneiden. 
Maultaschen diagonal halbieren, kurz in einer Pfanne mit Öl anbraten und anschließend herrausnehmen.
Gemüse und Champignons im Bratöl anbraten. 
Maultaschen wieder hinzufügen und Gemüsebrühe angießen - 
ca 5 Minuten garen lassen. 
In der zwischenzeit Schnittlauch (bis auf etwas zum Garnieren) mit dem Schmand verrühren.
Mit Salz und Pfeffer abschmecken. Die Maultschen mit einem klecks Schmand und restlichen Schnittlauch servieren`;

  var zutaten = `1 Packung Maultaschen
250 g Champignons
2 Paprika
1 Stange Porree
2 EL Öl
100 ml Gemüsebrühe
0.5 Bund Schnittlauch
100 g Schmand`;

  document.getElementById("Name").value = name;
  document.getElementById("Zutaten").value = zutaten;
  document.getElementById("Beschreibung").value = beschreibung;
}

function cleardata() {
  document.getElementById("Name").value = "";
  document.getElementById("Zutaten").value = "";
  document.getElementById("Beschreibung").value = "";
  localStorage.removeItem("image");
  document.getElementById("image-input").value = null;
}

document.getElementById("myForm").addEventListener("submit", function (e) {
  e.preventDefault();
  //Daten in local Storage
  getData(e.target);

  // Bild
  var imageInput = document.getElementById("image-input");
  var image = imageInput.files[0];

  if (image) {
    // process the selected image
    var reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = function () {
      // do something with the image data, for example:
      localStorage.setItem("image", reader.result);
    };
  }
  // Seitenwechsel
  seitenWechsel("./card.html");
});

document.getElementById("testme").addEventListener("click", testdata);
document.getElementById("btn_clear").addEventListener("click", cleardata);

function fillDataFromStorage() {
  document.getElementById("Name").value = localStorage.getItem("Name");
  document.getElementById("Zutaten").value = localStorage.getItem("Zutaten");
  document.getElementById("Beschreibung").value =
    localStorage.getItem("Beschreibung");
}
