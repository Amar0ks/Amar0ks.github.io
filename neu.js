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

document.getElementById("myForm").addEventListener("submit", function (e) {
  e.preventDefault();
  getData(e.target);

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

  seitenWechsel("./card.html");
});
