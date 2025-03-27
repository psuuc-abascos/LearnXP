document.addEventListener("DOMContentLoaded", () => {
    const walletAddress = localStorage.getItem("walletAddress");
    const role = localStorage.getItem("selectedRole");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingMessage = document.getElementById("loadingMessage");
    const mapGrid = document.getElementById("mapGrid");
    const newClassModal = new bootstrap.Modal(document.getElementById("newClassModal"));
    const classTitleInput = document.getElementById("classTitle");
    const mapPreview = document.getElementById("mapPreview");
    const saveClassBtn = document.getElementById("saveClassBtn");

    if (!walletAddress || !role || role !== "Teacher") {
        console.log("Redirecting to index.html due to missing wallet, role, or incorrect role");
        window.location.href = "index.html";
        return;
    }

    // Available map images for random selection
    const mapImages = [
        "/icons/Map1.png",
        "/icons/Map2.png",
        "/icons/Map3.png",
        "/icons/Map4.png",
        "/icons/Map5.png",
        "/icons/Map6.png"
    ];

    // Load maps from the backend
    let maps = [];

    function loadMaps() {
        loadingOverlay.classList.add("active");
        loadingMessage.textContent = "Loading Maps...";

        fetch(`/maps/${walletAddress}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                maps = data.maps || [];
                displayMaps(maps);
                loadingOverlay.classList.remove("active");
            })
            .catch(error => {
                console.error("Error fetching maps:", error);
                alert("Failed to load maps. Please try again later.");
                maps = [];
                displayMaps(maps);
                loadingOverlay.classList.remove("active");
            });
    }

    // Display maps in the grid
    function displayMaps(maps) {
        mapGrid.innerHTML = "";
        if (maps.length === 0) {
            mapGrid.innerHTML = '<p class="empty-state"><i class="bi bi-exclamation-circle"></i> No classes created yet. Click "New Class" to add one.</p>';
            return;
        }
        maps.forEach(map => {
            const mapCard = document.createElement("div");
            mapCard.className = "map-card";
            mapCard.innerHTML = `
                <img src="${map.image}" alt="${map.name}" onerror="this.src='/icons/Map1.png';">
                <div class="map-name">${map.name.toUpperCase()}</div>
            `;
            mapGrid.appendChild(mapCard);
        });
    }

    // Handle New Class button click
    document.querySelector(".new-class-btn").addEventListener("click", () => {
        // Select a random map image
        const randomMapImage = mapImages[Math.floor(Math.random() * mapImages.length)];
        mapPreview.src = randomMapImage;
        classTitleInput.value = "";
        newClassModal.show();
    });

    // Handle Save button in the modal
    saveClassBtn.addEventListener("click", () => {
        const subjectName = classTitleInput.value.trim();
        if (!subjectName) {
            alert("Please enter a subject name.");
            return;
        }

        const newMap = {
            id: maps.length + 1, // Simple ID generation (replace with server-side ID if needed)
            name: subjectName,
            description: `Explore ${subjectName} concepts.`,
            image: mapPreview.src
        };

        // Save the new map to the backend
        loadingOverlay.classList.add("active");
        loadingMessage.textContent = "Saving Class...";

        fetch(`/maps/${walletAddress}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMap)
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.success) {
                maps.push(newMap);
                displayMaps(maps);
                newClassModal.hide();
            } else {
                alert("Failed to save class: " + (data.message || "Unknown error"));
            }
            loadingOverlay.classList.remove("active");
        })
        .catch(error => {
            console.error("Error saving class:", error);
            alert("Failed to save class. Please try again later.");
            loadingOverlay.classList.remove("active");
        });
    });

    // Initial load
    loadMaps();
});