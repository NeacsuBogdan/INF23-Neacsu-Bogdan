class Card {
    constructor(title, content, explicit) {
      this.title = title;
      this.content = content;
      this.explicit = explicit;
      this.element = this.createCardElement();
    }
  
    createCardElement() {
      const card = document.createElement("div");
      card.classList.add("card");
      card.textContent = this.title;
  
      card.addEventListener("click", () => {
        this.openPopup();
      });
  
      return card;
    }
  
    openPopup() {
      let explicitContent = localStorage.getItem('explicit_content');
      explicitContent = explicitContent === 'true';
  
      if (!explicitContent && this.explicit) {
        warningPopup.style.display = "block";
        warningPopupYes.addEventListener("click", () => {
          warningPopup.style.display = "none";
          this.showPoemPopup();
        });
        warningPopupNo.addEventListener("click", () => {
          warningPopup.style.display = "none";
        });
      } else {
        this.showPoemPopup();
      }
    }
  
    showPoemPopup() {
      popupTitle.textContent = this.title;
  
      const versuri = this.content.split("\n");
      const versuriHTML = versuri.join("<br>");
      popupPoem.innerHTML = versuriHTML;
  
      popup.style.display = "block";
    }
  
    closePopup() {
      popup.style.display = "none";
    }
  }
  
  const cardContainer = document.querySelector(".card-container");
  const popup = document.getElementById("popup");
  const warningPopup = document.getElementById("warning-popup");
  const popupTitle = document.getElementById("popup-title");
  const popupPoem = document.getElementById("popup-poem");
  const closePopup = document.getElementById("close-popup");
  const closeWarningPopup = document.getElementById("close-warning-popup");
  const warningPopupYes = document.getElementById("warning-popup-yes");
  const warningPopupNo = document.getElementById("warning-popup-no");
  
  function createCard(title, content, explicit) {
    const card = new Card(title, content, explicit);
    cardContainer.appendChild(card.element);
  }
  
  function closePopupHandler() {
    popup.style.display = "none";
  }
  
  function fetchData() {
    const storedPoezii = sessionStorage.getItem('poezii');
    if (storedPoezii) {
      const poezii = JSON.parse(storedPoezii);
      poezii.forEach(poezie => {
        createCard(poezie.titlu, poezie.continut, poezie.explicit);
      });
    } else {
      console.error('No poezii found in sessionStorage. Please fetch and store the poezii first.');
    }
  }
  
  fetchData();
  
  closePopup.addEventListener("click", () => {
    closePopupHandler();
  });
  
  closeWarningPopup.addEventListener("click", () => {
    warningPopup.style.display = "none";
  });
  