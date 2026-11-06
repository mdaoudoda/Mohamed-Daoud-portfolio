(function () {
  var pages = ["index.html", "career.html", "skills.html", "projects.html", "personal.html"];
  var styles = ["assets/css/about.css", "assets/css/career.css", "assets/css/skills.css", "assets/css/projects.css", "assets/css/personal.css"];
  var file = location.pathname.split("/").pop();
  if (!file || file === "index.html") file = "index.html";
  var index = pages.indexOf(file);

  document.addEventListener("keydown", function (event) {
    if (index < 0) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      if (pages[index + 1]) location.href = pages[index + 1];
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      if (pages[index - 1]) location.href = pages[index - 1];
    }
  });

  var photoViewer = document.querySelector(".photo-viewer");
  var photoViewerImage = document.querySelector(".photo-viewer-image");
  if (photoViewer && photoViewerImage) {
    document.querySelectorAll(".gallery-photo").forEach(function (button) {
      button.addEventListener("click", function () {
        var thumbnail = button.querySelector("img");
        photoViewerImage.src = button.dataset.fullImage;
        photoViewerImage.alt = thumbnail ? thumbnail.alt : "";
        photoViewer.showModal();
      });
    });
    document.querySelector(".photo-viewer-close").addEventListener("click", function () {
      photoViewer.close();
    });
    photoViewer.addEventListener("click", function (event) {
      if (event.target === photoViewer) photoViewer.close();
    });
  }

  var printRoot = null;

  function ensureCss(href) {
    var existing = document.querySelector('link[rel="stylesheet"][href="' + href + '"]');
    if (existing) return Promise.resolve();
    return new Promise(function (resolve) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = function () { resolve(); };
      link.onerror = function () { resolve(); };
      document.head.appendChild(link);
    });
  }

  function buildPrintRoot() {
    if (printRoot) return Promise.resolve(printRoot);
    return Promise.all(styles.map(ensureCss)).then(function () {
      return Promise.all(pages.map(function (page) {
        return fetch(page).then(function (response) { return response.text(); });
      }));
    }).then(function (sources) {
      printRoot = document.createElement("div");
      printRoot.className = "print-root";
      sources.forEach(function (source, sheetIndex) {
        var parsed = new DOMParser().parseFromString(source, "text/html");
        var canvas = parsed.querySelector(".slide-canvas");
        if (!canvas) return;
        var pageUrl = new URL(pages[sheetIndex], location.href);
        canvas.querySelectorAll("[src]").forEach(function (node) {
          var raw = node.getAttribute("src");
          if (raw) node.setAttribute("src", new URL(raw, pageUrl).href);
        });
        canvas.removeAttribute("data-fixed-canvas");
        var footer = canvas.querySelector(".slide-footer");
        if (footer) footer.remove();
        var sheet = document.createElement("section");
        sheet.className = (parsed.body.className || ("page-" + pages[sheetIndex].replace(".html", ""))) + " print-sheet";
        sheet.appendChild(document.importNode(canvas, true));
        printRoot.appendChild(sheet);
        if (!sheet.className.trim()) sheet.classList.add("page-" + pages[sheetIndex].replace(".html", ""));
      });
      document.body.appendChild(printRoot);
      return printRoot;
    });
  }

  document.querySelectorAll(".print-button").forEach(function (button) {
    button.addEventListener("click", function () {
      button.disabled = true;
      buildPrintRoot().then(function () {
        window.print();
      }).finally(function () {
        button.disabled = false;
      });
    });
  });
})();
