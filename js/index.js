const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");
const galleryImages = document.querySelectorAll(".gallery-grid img");
const dateInput = document.querySelector("#til-date");
const titleInput = document.querySelector("#til-title");
const contentInput = document.querySelector("#til-content");
const submitButton = tilForm.querySelector('button[type="submit"]');
const resetButton = tilForm.querySelector('button[type="reset"]');
const passwordModal = document.querySelector("#password-modal");
const passwordForm = document.querySelector("#password-form");
const passwordModalTitle = document.querySelector("#password-modal-title");
const passwordInput = document.querySelector("#password-input");
const passwordCancelButton = document.querySelector("#password-cancel-button");
const imageModal = document.querySelector("#image-modal");
const imageModalImage = document.querySelector("#image-modal-image");
const imageModalCloseButton = document.querySelector("#image-modal-close");
const STORAGE_KEY = "tilItems";
const TIL_PASSWORD = "0717";
let editingIndex = null;
let passwordResolver = null;

function verifyPassword(actionLabel) {
  passwordModalTitle.textContent = `${actionLabel} 비밀번호 확인`;
  passwordInput.value = "";
  passwordModal.classList.remove("hidden");
  passwordInput.focus();

  return new Promise(function (resolve) {
    passwordResolver = resolve;
  });
}

function closePasswordModal(isVerified) {
  passwordModal.classList.add("hidden");
  passwordForm.reset();

  if (passwordResolver) {
    passwordResolver(isVerified);
    passwordResolver = null;
  }
}

function openImageModal(image) {
  imageModalImage.src = image.src;
  imageModalImage.alt = image.alt;
  imageModal.classList.remove("hidden");
}

function closeImageModal() {
  imageModal.classList.add("hidden");
  imageModalImage.src = "";
  imageModalImage.alt = "";
}

function setFormMode() {
  submitButton.textContent = editingIndex === null ? "등록" : "수정";
  resetButton.textContent = editingIndex === null ? "초기화" : "수정 취소";
}

function createTilItemElement(item, index) {
  const article = document.createElement("article");
  article.className = "til-item";

  const actionButtons = document.createElement("div");
  actionButtons.className = "til-item-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "til-action-button";
  editButton.textContent = "수정";
  editButton.addEventListener("click", function () {
    dateInput.value = item.date;
    titleInput.value = item.title;
    contentInput.value = item.content;
    editingIndex = index;
    setFormMode();
    titleInput.focus();
    tilForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "til-action-button";
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", async function () {
    if (!(await verifyPassword("삭제"))) {
      return;
    }

    const items = getStoredItems();
    items.splice(index, 1);
    saveItems(items);

    if (editingIndex === index) {
      editingIndex = null;
      tilForm.reset();
      setFormMode();
    } else if (editingIndex !== null && editingIndex > index) {
      editingIndex -= 1;
    }

    renderItems();
  });

  const time = document.createElement("time");
  time.textContent = item.date;

  const title = document.createElement("h3");
  title.textContent = item.title;

  const content = document.createElement("p");
  content.textContent = item.content;

  actionButtons.append(editButton, deleteButton);
  article.append(actionButtons, time, title, content);

  return article;
}

function getInitialItems() {
  const exampleItem = tilList.querySelector(".til-item");

  if (!exampleItem) {
    return [];
  }

  return [
    {
      date: exampleItem.querySelector("time")?.textContent ?? "",
      title: exampleItem.querySelector("h3")?.textContent ?? "",
      content: exampleItem.querySelector("p")?.textContent ?? "",
    },
  ];
}

function getStoredItems() {
  const savedItems = localStorage.getItem(STORAGE_KEY);

  if (savedItems) {
    return JSON.parse(savedItems);
  }

  const initialItems = getInitialItems();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
  return initialItems;
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderItems() {
  const items = getStoredItems();
  tilList.innerHTML = "";

  items.forEach(function (item, index) {
    tilList.appendChild(createTilItemElement(item, index));
  });
}

passwordForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (passwordInput.value !== TIL_PASSWORD) {
    window.alert("비밀번호가 올바르지 않습니다.");
    passwordInput.select();
    return;
  }

  closePasswordModal(true);
});

passwordCancelButton.addEventListener("click", function () {
  closePasswordModal(false);
});

passwordModal.addEventListener("click", function (event) {
  if (event.target === passwordModal) {
    closePasswordModal(false);
  }
});

galleryImages.forEach(function (image) {
  image.addEventListener("click", function () {
    openImageModal(image);
  });
});

imageModalCloseButton.addEventListener("click", closeImageModal);

imageModal.addEventListener("click", function (event) {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePasswordModal(false);
    closeImageModal();
  }
});

tilForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const actionLabel = editingIndex === null ? "등록" : "수정";

  if (!(await verifyPassword(actionLabel))) {
    return;
  }

  const formData = new FormData(tilForm);
  const item = {
    date: formData.get("date"),
    title: formData.get("title"),
    content: formData.get("content"),
  };

  const items = getStoredItems();

  if (editingIndex === null) {
    items.unshift(item);
  } else {
    items[editingIndex] = item;
  }

  saveItems(items);
  editingIndex = null;
  renderItems();
  tilForm.reset();
  setFormMode();
});

tilForm.addEventListener("reset", function () {
  editingIndex = null;
  window.setTimeout(setFormMode, 0);
});

setFormMode();
renderItems();
