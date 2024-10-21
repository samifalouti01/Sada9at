document.addEventListener("DOMContentLoaded", () => {
    const addAnnouncementBtn = document.getElementById("addAnnouncementBtn");
    const popup = document.getElementById("popup");
    const closePopup = document.getElementById("closePopup");
    const announcementForm = document.getElementById("announcementForm");
    const cardsContainer = document.getElementById("cardsContainer");
    const codeInput = document.getElementById("code");
    const searchBar = document.getElementById("searchBar");
    const languageSelector = document.getElementById("languageSelector");
    const optionsContainer = document.querySelector(".options");
    const clearSearch = document.getElementById("clearSearch");
    const loadingSpinner = document.getElementById("loadingSpinner");

    let mosqueData = [];
    const validCodes = ["CODE1", "CODE2", "CODE3"];
    
    popup.style.display = "none";
    
    addAnnouncementBtn.onclick = () => popup.style.display = "flex";
    closePopup.onclick = () => popup.style.display = "none";
    
    window.onclick = (event) => {
        if (event.target === popup) popup.style.display = "none";
    };
    
    fetchMosqueData();

    announcementForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const enteredCode = codeInput.value.trim();
        
        if (!validCodes.includes(enteredCode)) {
            alert("The code you entered is not valid.");
            return;
        }
    
        // Get the selected country code and WhatsApp number
        const countryCode = document.getElementById("countryCode").value;
        let whatsappNumber = document.getElementById("whatsappEmbed").value.trim();
        
        // Remove leading '0' from whatsappNumber if it begins with '0'
        if (whatsappNumber.startsWith("0")) {
            whatsappNumber = whatsappNumber.replace(/^0/, '');
        }
    
        // Concatenate the values into a single field
        const combinedWhatsAppEmbed = countryCode + whatsappNumber;
    
        // Create a new FormData object and append the combined field
        const formData = new FormData(announcementForm);
        formData.set("whatsappEmbed", combinedWhatsAppEmbed); // Set the combined field
    
        const params = new URLSearchParams(formData).toString();
    
        fetch("https://script.google.com/macros/s/AKfycbwukuiBiW8x4liw6I7r5F9zXkGiUMZ3la3yeucf_ssPHFQlxbGCv4VhTuguWPhtXK69/exec", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Announcement added successfully.");
                announcementForm.reset();
                popup.style.display = "none";
                fetchMosqueData();
            } else {
                alert("Error: " + (data.error || "Unknown error"));
            }
        })
        .catch(error => console.error("Error submitting form:", error));
    });
    
    

    searchBar.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        clearSearch.style.display = searchTerm.length > 0 ? 'inline' : 'none';

        const filteredData = mosqueData.filter(item =>
            item.mosqueName.toLowerCase().includes(searchTerm) ||
            item.imamName.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm)
        );
        displayCards(filteredData);
    });

    clearSearch.addEventListener("click", () => {
        searchBar.value = "";
        clearSearch.style.display = 'none';
        displayCards(mosqueData);
    });

    languageSelector.onclick = () => {
        optionsContainer.style.display =
            optionsContainer.style.display === "none" || optionsContainer.style.display === "" ? "block" : "none";
    };

    window.addEventListener("click", (event) => {
        if (!event.target.closest('.custom-select')) {
            optionsContainer.style.display = "none";
        }
    });

    const defaultLanguage = 'ar';
    initializeLanguage(defaultLanguage);

    document.querySelectorAll(".option").forEach(option => {
        option.addEventListener("click", (event) => {
            const selectedValue = option.getAttribute("data-value");
            initializeLanguage(selectedValue);
            optionsContainer.style.display = "none";
        });
    });

    function initializeLanguage(language) {
        const translations = {
            en: {
                addAnnouncement: "Add an Announcement",
                searchPlaceholder: "Search for patients...",
                submit: "Submit",
            },
            ar: {
                addAnnouncement: "إضافة إعلان",
                searchPlaceholder: "البحث عن المرضى...",
                submit: "إرسال",
            },
        };

        const text = translations[language];

        document.getElementById("popupTitle").textContent = text.addAnnouncement;
        document.getElementById("addAnnouncementBtn").textContent = text.addAnnouncement;
        document.getElementById("searchBar").placeholder = text.searchPlaceholder;
        document.querySelector("button[type='submit']").textContent = text.submit;

        const selectedOption = document.querySelector(`.option[data-value="${language}"]`);
        if (selectedOption) {
            const selectedLabel = selectedOption.textContent;
            const selectedFlagSrc = selectedOption.querySelector(".flag").src;

            languageSelector.innerHTML = `
                <img src="${selectedFlagSrc}" alt="${selectedLabel} Flag" class="flag">
                <span class="selected-label">${selectedLabel}</span>
                <i class="fas fa-chevron-down"></i>
            `;
        }
    }

    function displayCards(data) {
        const cardsContainer = document.getElementById('cardsContainer');
        if (!cardsContainer) {
            console.error('cardsContainer element not found');
            return;
        }

        cardsContainer.innerHTML = "";

        let cardContainerHtml = `
            <div class="title">
                <h1>بسم الله الرحمن الرحيم<br>
                    <small style="text-align: center; font-size: 0.8em; padding: 5px;">
                        يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَنفِقُوا۟ مِمَّا رَزَقْنَـٰكُم مِّن قَبْلِ أَن يَأْتِىَ يَوْمٌ لَّا بَيْعٌ فِيهِ وَلَا خُلَّةٌ وَلَا شَفَـٰعَةٌ ۗ وَٱلْكَـٰفِرُونَ هُمُ ٱلظَّـٰلِمُونَ (٢٥٤)<br><br>
                        — سورة البقرة (2:254)
                    </small>
                </h1>
            </div>`;
        cardsContainer.innerHTML += cardContainerHtml;

        data.forEach(item => {
            const card = document.createElement("div");
            card.className = "card";
            const direction = isArabic(item.description) ? "rtl" : "ltr";
            card.setAttribute("dir", direction);

            let cardHTML = `
                <div class="card-text">
                    <h3 style="text-align: center;">${item.title}</h3>
                    <h5 style="border-radius: 15px; padding: 5px; border: 1.5px solid black; text-align: center;">🏛️ ${item.associationName}</h5>
                    <p style="text-align: left;">📍 Location: ${item.location}</p>
                    <p class="description">${item.description}</p>
                </div>
            `;

            let contactHTML = '';

            if (item.facebookEmbed) {
                contactHTML += `
                    <div class="card-text">
                        <a href="${item.facebookEmbed}" target="_blank" rel="noopener noreferrer">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" style="width: 50px; height: 50px; margin-top: 8px;">
                        </a>
                    </div>
                `;
            }
            
            if (item.whatsappEmbed) {
                contactHTML += `
                    <div class="card-text">
                        <a href="https://wa.me/${item.whatsappEmbed}" target="_blank" rel="noopener noreferrer">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/640px-WhatsApp.svg.png" alt="WhatsApp" style="width: 60px; height: 60px; margin-top: 8px;">
                        </a>
                    </div>
                `;
            }
            
            if (contactHTML) {
                cardHTML += `
                    <div class="card-text">
                        <h4>Contact:</h4>
                        ${contactHTML}
                    </div>
                `;
            }

            card.innerHTML = cardHTML;
            cardsContainer.appendChild(card);
        });
    }

    function isArabic(text) {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    }

    function fetchMosqueData() {
        loadingSpinner.style.display = "flex";
        
        fetch("https://script.google.com/macros/s/AKfycbwukuiBiW8x4liw6I7r5F9zXkGiUMZ3la3yeucf_ssPHFQlxbGCv4VhTuguWPhtXK69/exec")
            .then(response => response.json())
            .then(data => {
                mosqueData = data;
                displayCards(data);
            })
            .catch(error => console.error("Error fetching mosque data:", error))
            .finally(() => {
                loadingSpinner.style.display = "none";
            });
    }

    let startY;
    let isPulling = false;

    window.addEventListener("touchstart", (event) => {
        startY = event.touches[0].clientY;
    });

    window.addEventListener("touchmove", (event) => {
        const currentY = event.touches[0].clientY;
        const distanceY = currentY - startY;

        if (distanceY > 100 && window.scrollY === 0) {
            isPulling = true;
        }
    });

    window.addEventListener("touchend", () => {
        if (isPulling) {
            fetchMosqueData();
            isPulling = false;
        }
    });
});