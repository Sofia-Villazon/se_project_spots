import "./index.css";

import {
  enableValidation,
  resetValidation,
  disableBtnElement,
} from "../scripts/validation.js";

import { settings, initialCards } from "../scripts/vendor/utils/constants.js";

import Api from "../scripts/vendor/Apis.js";
import { setButtonText } from "../scripts/vendor/utils/helpers.js";

// API
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "d3f0bdf3-6cec-43f8-aeb2-29cf902dd88c",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach((item) => {
      cardsGrid.prepend(getCardElement(item));
    });
    profileNameElement.textContent = user.name;
    profileJobElement.textContent = user.about;
    profileImageElement.src = user.avatar;
  })

  .catch((error) => {
    console.log("Failed to add card:", error);
  });

const formModals = document.querySelectorAll(".modal");

// Profile modal
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const profileFormElement = editProfileModal.querySelector(".modal__form");
const nameInput = editProfileModal.querySelector("#profile-name-input");
const jobInput = editProfileModal.querySelector("#profile-description-input");
const profileSubmitBtn = editProfileModal.querySelector(".modal__submit-btn");

// New post modal
const postButton = document.querySelector(".profile__post-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const addCardFormElement = document.forms["editProfileForm"];
const captionInput = newPostModal.querySelector("#card-caption-input");
const linkInput = newPostModal.querySelector("#card-image-input");
const cardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");

// Delete card modal
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteFormCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteFormCancelBtn = deleteModal.querySelector(
  ".modal__submit-btn_cancel"
);

// Profile image modal
const profileImageModal = document.querySelector("#profile-picture-modal");
const profileImageFormCloseBtn =
  profileImageModal.querySelector(".modal__close-btn");
const profileImageInput = profileImageModal.querySelector(".modal__input");
const profilePictureFormElement =
  profileImageModal.querySelector(".modal__form");

// Profile elements
const profileNameElement = document.querySelector(".profile__name");
const profileJobElement = document.querySelector(".profile__description");
const profileImageElement = document.querySelector(".profile__photo");
const profileImageBtn = document.querySelector(".profile__avatar-btn");
const profileButton = document.querySelector(".profile__button");

// Image preview modal
const imagePreviewModal = document.querySelector("#image-preview-modal");
const imagePreviewCloseBtn = imagePreviewModal.querySelector(
  ".modal__close-btn_type_preview"
);
const imagePreviewImage = imagePreviewModal.querySelector(".modal__image");
const imagePreviewCaption = imagePreviewModal.querySelector(".modal__caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsGrid = document.querySelector(".cards__grid");

let selectedCard, selectedCardId;

imagePreviewCloseBtn.addEventListener("click", function () {
  closeModal(imagePreviewModal);
});

deleteFormCloseBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

deleteFormCancelBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

profileImageFormCloseBtn.addEventListener("click", function () {
  closeModal(profileImageModal);
});

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Delete", "Deleting");

  api
    .deleteCards(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false));
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleProfilePictureForm(evt) {
  openModal(profileImageModal);
}

profileImageBtn.addEventListener("click", (evt) => {
  handleProfilePictureForm(evt);
});

function handleProfilePictureFormSubmit(evt) {
  evt.preventDefault();

  api
    .editAvatar(profileImageInput.value)
    .then(() => {
      profileImageElement.src = profileImageInput.value;
    })
    .then(() => closeModal(profileImageModal))
    .catch(console.error);
}

profilePictureFormElement.addEventListener(
  "submit",
  handleProfilePictureFormSubmit
);

function handleLikeCard(evt, cardId) {
  const isLiked = evt.target.classList.contains("card__button_active");

  api
    .likeCards({ cardId, isLiked })
    .then(() => {
      evt.target.classList.toggle("card__button_active");
    })
    .catch(console.error);
}
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  const cardLikeButton = cardElement.querySelector(".card__like-button");

  if (data.isLiked) {
    cardLikeButton.classList.add("card__button_active");
  }

  cardLikeButton.addEventListener("click", (evt) => {
    handleLikeCard(evt, data._id);
  });

  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardDeleteButton.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImage.addEventListener("click", function () {
    imagePreviewCaption.textContent = data.name;
    imagePreviewImage.src = data.link;
    imagePreviewImage.alt = data.name;
    openModal(imagePreviewModal);
  });

  return cardElement;
}

function closeOnEscape(evt) {
  if (evt.key === "Escape" || evt.keyCode === 27) {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", closeOnEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keyup", closeOnEscape);
}

formModals.forEach(function (form) {
  form.addEventListener("click", (evt) => {
    if (evt.target === form) {
      closeModal(form);
    }
  });
});

profileButton.addEventListener("click", function () {
  openModal(editProfileModal);
  nameInput.value = profileNameElement.textContent;
  jobInput.value = profileJobElement.textContent;

  resetValidation(editProfileModal, [nameInput, jobInput], settings);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

postButton.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editUsersInfo({ name: nameInput.value, about: jobInput.value })
    .then((data) => {
      profileJobElement.textContent = data.about;
      profileNameElement.textContent = data.name;
      disableBtnElement(profileSubmitBtn, settings);
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false));
}

profileFormElement.addEventListener("submit", handleProfileFormSubmit);

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  console.log(submitBtn.textContent);
  api
    .addCards({ name: captionInput.value, link: linkInput.value })
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsGrid.prepend(cardElement);
      evt.target.reset();
      disableBtnElement(cardSubmitBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false));
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

addCardFormElement.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);
