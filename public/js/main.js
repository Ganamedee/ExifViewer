document.addEventListener("DOMContentLoaded", () => {
  AOS.init({
    duration: 600,
    once: false,
    offset: 80,
    delay: 30,
    easing: "ease-out",
    mirror: true,
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  const form = document.getElementById("uploadForm");
  const dropZone = document.querySelector(".drop-zone");
  const resultDiv = document.getElementById("result");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const removeBtn = document.getElementById("removeBtn");
  const searchInput = document.getElementById("searchInput");
  let currentFile = null;
  let currentAbortController = null;

  const resetUploadArea = () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    dropZone.innerHTML = `<p>Drop your image here or click anywhere in this area to upload</p>`;
    currentFile = null;
    removeBtn.style.display = "none";
    resultDiv.innerHTML = "";
    analyzeBtn.innerHTML = "Analyze Image";
    analyzeBtn.disabled = false;
    const newInput = document.createElement("input");
    newInput.type = "file";
    newInput.id = "imageInput";
    newInput.name = "image";
    newInput.accept = "image/*";
    newInput.hidden = true;
    dropZone.appendChild(newInput);
    document
      .getElementById("imageInput")
      .addEventListener("change", handleFileSelect);
  };

  const handleFileSelect = (e) => {
    currentFile = e.target.files[0];
    showImagePreview(currentFile);
  };

  document
    .getElementById("imageInput")
    .addEventListener("change", handleFileSelect);
  removeBtn.addEventListener("click", resetUploadArea);

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".metadata-card");

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const searchWords = searchTerm
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (searchWords.length === 0) {
        card.style.display = "block";
        return;
      }

      const matches = searchWords.some((word) => text.includes(word));
      card.style.display = matches ? "block" : "none";
    });
  });

  function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      dropZone.innerHTML = `
        <img src="${e.target.result}" class="preview-image">
        <p>Selected: ${file.name}</p>
      `;
      removeBtn.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  analyzeBtn.addEventListener("click", () => {
    if (currentFile) {
      analyzeBtn.innerHTML = '<div class="loader"></div>';
      analyzeBtn.disabled = true;
      handleFile(currentFile);
    }
  });

  function handleFile(file) {
    currentAbortController = new AbortController();
    const formData = new FormData();
    formData.append("image", file);

    fetch("/upload", {
      method: "POST",
      body: formData,
      signal: currentAbortController.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        resultDiv.innerHTML = "";
        displayMetadata(data);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          showErrorToast("Error processing image. Please try again.");
          console.error("Error:", error);
        }
      })
      .finally(() => {
        analyzeBtn.innerHTML = "Analyze Image";
        analyzeBtn.disabled = false;
        currentAbortController = null;
      });
  }

  function displayMetadata(data) {
    resultDiv.innerHTML = "";
    let delay = 0;

    for (const [category, values] of Object.entries(data.metadata)) {
      if (typeof values === "object" && Object.keys(values).length > 0) {
        const card = document.createElement("div");
        card.className = "metadata-card fade-scroll";
        card.setAttribute("data-aos", "fade-up");
        card.setAttribute("data-aos-delay", delay);
        delay += 10;

        let content = `<h3>${category}</h3><ul>`;
        for (const [key, value] of Object.entries(values)) {
          if (key.toLowerCase().includes("id")) continue;

          let displayValue = value;
          if (value && value.description) {
            displayValue = value.description;
          } else if (typeof value === "string" && value.length > 100) {
            displayValue = value.substring(0, 100) + "...";
          }

          content += `<li><strong>${key}:</strong> ${displayValue}</li>`;
        }
        content += "</ul>";

        card.innerHTML = content;
        resultDiv.appendChild(card);

        VanillaTilt.init(card, {
          max: 8,
          speed: 400,
          scale: 1.02,
          glare: true,
          "max-glare": 0.2,
          perspective: 1000,
          transition: true,
          easing: "cubic-bezier(.03,.98,.52,.99)",
          gyroscope: false,
        });

        observer.observe(card);
      }
    }

    setTimeout(() => {
      AOS.refreshHard();
    }, 100);
  }

  function showErrorToast(message) {
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
