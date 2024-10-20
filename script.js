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

        const formData = new FormData(announcementForm);
        const params = new URLSearchParams(formData).toString();

        fetch("https://script.google.com/macros/s/AKfycbx7fldYXvCCsADB82i0Ee-3yxy4mAOhQQLgpV2CuxcvN5NifXGbODpnJWXSOzUC9Bf9/exec", {
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
                searchPlaceholder: "Search for mosques...",
                submit: "Submit",
            },
            ar: {
                addAnnouncement: "إضافة إعلان",
                searchPlaceholder: "ابحث عن المساجد...",
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
                        "وَأَنفِقُوا فِي سَبِيلِ اللَّهِ وَأَحْسِنُوا ۚ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ"<br><br>
                        — سورة البقرة (2:195)
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
                    <h3 style="text-align: center;">${item.mosqueName}</h3>
                    <h5 style="border-radius: 15px; padding: 5px; border: 1.5px solid black; text-align: center;">${item.imamName}</h5>
                    <p style="text-align: left;">Location: ${item.location}</p>
                    <p class="description">${item.description}</p>
                </div>
            `;

            if (item.facebookEmbed) {
                cardHTML += `
                    <div class="card-text">
                        <h4>Facebook Page:</h4>
                        <iframe
                            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fweb.facebook.com%2F${encodeURIComponent(item.facebookEmbed)}&tabs=timeline&width=300&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                            width="100%"
                            height="500"
                            style="border: 0; border-radius: 10px; overflow: hidden; max-width: 100%; height: 500px;"
                            scrolling="no"
                            frameborder="0"
                            allowfullscreen="true"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
                        </iframe>
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
        
        fetch("https://script.google.com/macros/s/AKfycbx7fldYXvCCsADB82i0Ee-3yxy4mAOhQQLgpV2CuxcvN5NifXGbODpnJWXSOzUC9Bf9/exec")
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
