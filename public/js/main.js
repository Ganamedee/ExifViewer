document.addEventListener("DOMContentLoaded", () => {
  // Initialise AOS with updated settings for a smoother animation
  // Update the AOS initialization
  AOS.init({
    duration: 600,
    once: false,
    offset: 80,
    delay: 30,
    easing: "ease-out",
    mirror: true,
  });

  // Intersection Observer to add/remove the 'visible' class for fade-scroll elements
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

  // Reset upload area function
  const resetUploadArea = () => {
    dropZone.innerHTML = `<p>Drop your image here or click anywhere in this area to upload</p>`;
    currentFile = null;
    removeBtn.style.display = "none";
    resultDiv.innerHTML = "";
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

  // Handle file selection
  const handleFileSelect = (e) => {
    currentFile = e.target.files[0];
    showImagePreview(currentFile);
  };

  // Initialise event listeners
  document
    .getElementById("imageInput")
    .addEventListener("change", handleFileSelect);
  removeBtn.addEventListener("click", resetUploadArea);

  // Search functionality
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

  // Show image preview function
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

  // Analyse button handler
  analyzeBtn.addEventListener("click", () => {
    if (currentFile) {
      analyzeBtn.innerHTML = '<div class="loader"></div>';
      analyzeBtn.disabled = true;
      handleFile(currentFile);
    }
  });

  // Handle file upload and processing
  function handleFile(file) {
    const formData = new FormData();
    formData.append("image", file);

    fetch("/upload", {
      method: "POST",
      body: formData,
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
        showErrorToast("Error processing image. Please try again.");
        console.error("Error:", error);
      })
      .finally(() => {
        analyzeBtn.innerHTML = "Analyze Image";
        analyzeBtn.disabled = false;
      });
  }

  // Display metadata cards with fade-scroll effect and reduced AOS delay
  function displayMetadata(data) {
    resultDiv.innerHTML = "";
    let delay = 0;

    for (const [category, values] of Object.entries(data.metadata)) {
      if (typeof values === "object" && Object.keys(values).length > 0) {
        const card = document.createElement("div");
        // Add both 'metadata-card' and 'fade-scroll' classes for styling and scroll animation
        card.className = "metadata-card fade-scroll";
        card.setAttribute("data-aos", "fade-up");
        card.setAttribute("data-aos-delay", delay);
        delay += 10; // Reduced delay for quicker appearance

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

        // Initialise VanillaTilt on the card for a subtle 3D effect
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

        // Observe the card so that it fades in/out on scroll
        observer.observe(card);
      }
    }

    // Refresh AOS after new content loads
    setTimeout(() => {
      AOS.refreshHard();
    }, 100);
  }

  // Show error toast function
  function showErrorToast(message) {
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
