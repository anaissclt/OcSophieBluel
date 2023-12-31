/*** 
I . Récupérations des images via javascript
***/



// Lien vers l'API
const apiUrl = 'http://localhost:5678/api/';

// Fonction qui récupére les projets
async function recoverProjects() {
  const response = await fetch(apiUrl + 'works');
  return response.json(); //contient les données JSON de l'API
}

// Fonction qui affiche les projets en HTML
async function viewProjects() {
  const gallery = document.querySelector('.gallery');

  if (gallery) {
    const projects = await recoverProjects();

    // Ajoutez vos nouveaux éléments
    projects.forEach((project) => {
      const projectCard = document.createElement('figure');
      projectCard.innerHTML = `<img src="${project.imageUrl}" alt="${project.title}"><figcaption>${project.title}</figcaption>`;
      gallery.appendChild(projectCard);
    });
  }
}

// Exécutez la fonction qui affiche les projets en HTML
document.addEventListener('DOMContentLoaded', () => {
  viewProjects();
});



/*** 
II. Filtrer les projets par catégories 
***/



// Stocke les données des projets
let data = [];

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('index.html')) {
    fetchProjects();
  }
});

// fonction qui récupère les projets depuis l'API 
async function fetchProjects() {
  const response = await fetch(apiUrl + 'works');
  if (!response.ok) return;

  data = await response.json();

  // Vérifier l'élément".gallery"
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    viewFilteredProjects();
    categoryButtons();
  }
}

// fonction qui extrait les catégories des projets
function extractCategories() {
  const categoryNames = data.map(project => project.category?.name).filter(Boolean); // filtrer les valeurs nulles/ non définies
  const uniqueCategoryNames = new Set(categoryNames); // Stocker ces noms dans un ensemble
  const categoriesArray = ['Tous', ...Array.from(uniqueCategoryNames)]; // Convertir en tableau
  return categoriesArray;
}

// fonction qui affiche les boutons pour chaque catégorie 
function categoryButtons() {
  const filtersContainer = document.querySelector('.filters');
  const categories = extractCategories(); // Obtenir les catégories à afficher

  filtersContainer.innerHTML = ''; //  Effacer les éléments précédents 

  // Créer un bouton pour chaque catégorie
  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;

    button.addEventListener('click', () => filterCategoryProjects(category));
    filtersContainer.appendChild(button);
  });
}

// fonction qui affiche les projets dans la galerie
function viewFilteredProjects(filteredProjects) {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';
  // Afficher les projets
  (filteredProjects || data).forEach(project => {
    const projectCard = document.createElement('figure');
    projectCard.innerHTML = `<img src="${project.imageUrl}" alt="${project.title}"><figcaption>${project.title}</figcaption>`;
    gallery.appendChild(projectCard);
  });
}

// fonction qui filtre les projets en fonction de la catégorie
function filterCategoryProjects(category) {
  const isAllCategory = category === 'Tous'; // Vérifier si catégorie = "Tous"

  // Filtrer les projets en fonction de la catégorie
  const filteredProjects = isAllCategory
    ? data // Si catégorie = "Tous", afficher tous les projets
    : data.filter(project => project.category?.name === category);

  viewFilteredProjects(filteredProjects);
}

document.addEventListener("DOMContentLoaded", fetchProjects);



/*** 
III. Authentification de l’utilisateur
***/



document.addEventListener('DOMContentLoaded', () => {
  const loginPage = window.location.pathname.includes('login.html');

  if (loginPage) {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêcher le rechargement de la page

        // Récupérer les valeurs du formulaire
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
          // Création de l'objet connexion
          const connexion = {
            email: email,
            password: password
          }

          // Création de la charge utile au format JSON
          const chargeUtile = JSON.stringify(connexion)

          // Envoyer les informations de connexion au serveur
          const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: chargeUtile
          });

          if (!response.ok) {
            throw new Error('Erreur dans l’identifiant ou le mot de passe.'); //connexion échoué
          }

          const data = await response.json(); // Récupère les données

          localStorage.setItem('token', data.token); // Stocker le token
          window.location.href = '../index.html';
        } catch (error) {
          console.error(error.message);
          alert(error.message);
        }
      });
    } else {
      console.error("L'ID 'loginForm' n'est pas trouvable.");
    }
  }
});



/*** 
IV.  Deconnection de l'utilisateur
***/



// Fonction pour masquer la classe "filters"
function hideFilters() {
  const filters = document.querySelector('.filters');
  if (filters) {
    filters.style.display = 'none';
  }
}

// Fonction pour afficher la classe "filters"
function showFilters() {
  const filters = document.querySelector('.filters');
  if (filters) {
    filters.style.display = 'flex';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const indexPage = window.location.pathname.includes('index.html');

  if (indexPage) {
    const logoutBtn = document.getElementById('loginLogout');
    const editBanner = document.querySelector('.banner');
    const btnModifier = document.querySelector('.btn-modifier');

    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (token) {
      // Utilisateur connecté
      logoutBtn.innerText = 'logout';
      editBanner.style.display = 'block';
      logoutBtn.addEventListener('click', () => {
        // Supprimer le token et rediriger vers la page d'accueil
        localStorage.removeItem('token');
        editBanner.style.display = 'none';
        window.location.href = './index.html';
      });

      // Afficher le bouton "Modifier" et ouvrir la modale
      btnModifier.style.display = 'block';
      btnModifier.onclick = ouvrirModal;
      // Masquer la classe "filters"
      hideFilters();

    } else {
      // Utilisateur non connecté
      logoutBtn.innerText = 'login';
      logoutBtn.addEventListener('click', () => {
        window.location.href = './assets/login.html';
      });
      // Réafficher la classe "filters"
      showFilters();
      // Cacher le bouton "Modifier"
      btnModifier.style.display = 'none';
    }
  }
});



/*** 
V. Ajout de la fenêtre modale
***/



async function viewProjectsModal() {
  const projects = await recoverProjects(); // Fonction qui récupére les projets 
  const galleryModal = document.querySelector('.galleryModal');

  galleryModal.innerHTML = '';

  projects.forEach((project) => { //parcourt chaque projet récupéré
    // Création de la carte de projet
    const projectCard = document.createElement('figure');
    // Ajout de l'image 
    const imgElement = document.createElement('img');
    imgElement.src = project.imageUrl;
    imgElement.alt = project.title;
    // Ajout de la poubelle
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');
    iconContainer.innerHTML = `<i class="fa-solid fa-trash" data-project-id="${project.id}"></i>`; //stocke l'identifiant du projet

    iconContainer.addEventListener('click', supprimerProjet);
    // Ajout de l'image et de l'encadré avec l'icône dans la carte du projet
    projectCard.appendChild(imgElement);
    projectCard.appendChild(iconContainer);

    galleryModal.appendChild(projectCard);
  });

}

// Fonctions pour ouvrir/fermer la modale
function ouvrirModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'block';
  viewProjectsModal();
}

function fermerModal() {
  modal.style.display = 'none';
  const modaleFormulaire = document.getElementById('modaleFormulaire');
  modaleFormulaire.style.display = 'none';

  // Réinitialiser le style du label pour "photo"
  const labelPhoto = document.querySelector('label[for="photo"]');
  labelPhoto.style.backgroundColor = '#CBD6DC';

  // Réinitialiser l'image d'aperçu
  const imagePreview = document.getElementById('imagePreview');
  imagePreview.style.display = 'none';

  // Réinitialiser les champs du formulaire
  const formulaire = document.querySelector('.modale-projet-form');
  formulaire.reset();

  // Réinitialiser la couleur de l'icône
  const imageIcon = document.querySelector('.form-group-photo i.fa-image');
  imageIcon.style.color = ""; // Réinitialiser la couleur de l'icône


  // Réinitialiser le contenu du pseudo-élément ::after
  const formGroupPhoto = document.querySelector('.form-group-photo');
  formGroupPhoto.style.content = "jpg, png : 4mo max"; // Réinitialiser le contenu de ::after

  // Supprimer la classe form-group-photo-selected
  formGroupPhoto.classList.remove('form-group-photo-selected');
}



/*** 
VI. Suppression d'un projet
***/



// Fonction maj galerie page d'accueil
async function majAccueil() {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';

  await viewProjects(); // Actualiser la galerie avec la maj projet
}

// Fonction maj galerie modale
async function majModale() {
  const galleryModal = document.querySelector('.galleryModal');
  galleryModal.innerHTML = '';

  await viewProjectsModal(); // Actualiser la galerie avec la maj modale
}

async function supprimerProjet(event) {
  const projectId = parseInt(event.target.getAttribute('data-project-id')); // récupère l'identifiant du projet à supprimer
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 204) {  // requête réussi
      await majAccueil();
      await majModale();
    } else if (response.status === 401) { // requête non effectuée
      alert('Vous n\'êtes pas autorisé à supprimer ce projet');
      window.location.href = 'login.html'; // redirigé l'user vers la page de connexion
    } else {
      console.error('Erreur lors de la suppression du projet:', response.status);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
  }
}



/*** 
VII. Affichage de la modale formulaire
***/



function afficherModaleFormulaire() {
  // Masquer la modale actuelle
  document.getElementById('modal').style.display = 'none';
  // Afficher la modale du formulaire
  const modaleFormulaire = document.getElementById('modaleFormulaire');
  modaleFormulaire.style.display = 'block';
}

function retourVersGalerie() {
  const modaleFormulaire = document.getElementById('modaleFormulaire');
  const modal = document.getElementById('modal');
  // Masquer la modale du formulaire
  modaleFormulaire.style.display = 'none';

  // Réinitialiser le style du label pour "photo"
  const labelPhoto = document.querySelector('label[for="photo"]');
  labelPhoto.style.backgroundColor = '#CBD6DC';

  // Réinitialiser la couleur de l'icône
  const imageIcon = document.querySelector('.form-group-photo i.fa-image');
  imageIcon.style.color = ""; // Réinitialiser la couleur de l'icône

  // Réinitialiser le contenu du pseudo-élément ::after
  const formGroupPhoto = document.querySelector('.form-group-photo');
  formGroupPhoto.style.content = "jpg, png : 4mo max"; // Réinitialiser le contenu de ::after

  // Supprimer la classe form-group-photo-selected
  formGroupPhoto.classList.remove('form-group-photo-selected');

  // Masquer l'image d'aperçu
  const imagePreview = document.getElementById('imagePreview');
  imagePreview.style.display = 'none';

  // Afficher la modale actuelle
  modal.style.display = 'block';

  // Réinitialiser les champs du formulaire
  const formulaire = document.querySelector('.modale-projet-form');
  formulaire.reset(); // Réinitialiser les champs du formulaire
}



/*** 
VIII. Affichage de l'image choisi
***/



const input = document.querySelector(".image");
const imagePreview = document.getElementById("imagePreview");
const labelPhoto = document.querySelector('label[for="photo"]');

const imageIcon = document.querySelector('.form-group-photo i.fa-image');

if (window.location.pathname.includes("index.html")) {
  input.addEventListener("change", function (event) { // écouteur d'événements qui surveille les changements
    const file = input.files[0]; //récupère le fichier image sélectionné par l'utilisateur
    const formGroupPhoto = document.querySelector('.form-group-photo');
    if (file) {

      // Afficher l'aperçu de l'image
      const reader = new FileReader(); //permet de lire le contenu du fichier
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";

        labelPhoto.style.backgroundColor = "transparent";

        // Rendre l'icône transparente
        imageIcon.style.color = "transparent";

        // Ajoutez la classe pour changer le contenu de ::after
        formGroupPhoto.classList.add('form-group-photo-selected');

      };
      reader.readAsDataURL(file); //démarre la lecture du fichier
    } else {
      imagePreview.style.display = "none";
      labelPhoto.style.backgroundColor = "#CBD6DC";

      // Rétablir la couleur de l'icône
      imageIcon.style.color = ""; 
      // Supprimez la classe pour réinitialiser le contenu de ::after
      formGroupPhoto.classList.remove('form-group-photo-selected');
    }
  });
}



/*** 
IX .Récupérer les catégories
***/



const token = localStorage.getItem("token");

// MAJ de la catégorie sélectionnée
const categoriesSelect = document.querySelector(".categoryId");
if (window.location.pathname.includes("index.html")) {
  categoriesSelect.addEventListener("change", function () {
    selectedCategory = categoriesSelect.value;
  });

  // Charger les catégories à l'initialisation
  fetchCategories();
}

let selectedCategory = null;

async function fetchCategories() {
  const categoriesSelect = document.querySelector(".categoryId");

  try {
    const response = await fetch("http://localhost:5678/api/categories", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const categories = await response.json();
      // Parcours des catégories/ ajout à la liste
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id; // Définit la valeur de l'option sur l'ID de la catégorie.
        option.textContent = category.name; //Définit le texte de l'option sur le nom de la catégorie.
        categoriesSelect.appendChild(option);
      });
    } else {
      console.log("Erreur lors de la récupération des catégories");
    }
  } catch (error) {
    console.error(error);
  }
}



/*** 
X. Envoie du projet 
***/



const btnAjouterProjet = document.querySelector(".formModalValide");
if (window.location.pathname.includes("index.html")) {
  btnAjouterProjet.addEventListener("click", addWork);
}

// Ajouter un projet
async function addWork(event) {
  event.preventDefault();
  // extrait des valeurs du formulaire
  const title = document.querySelector(".title").value;
  const categoryId = document.querySelector(".categoryId").value;
  const image = document.querySelector(".image").files[0];

  if (title === "" || selectedCategory === null || image === undefined) {
    alert("Merci de remplir tous les champs");
    return;
  } else {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", categoryId);
      formData.append("image", image);

      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 201) {
        fermerModal();
        viewProjects();
      } else if (response.status === 401) {
        alert("Vous n'êtes pas autorisé à ajouter un projet");
        window.location.href = "login.html";
      }
    }

    catch (error) {
      console.log(error);
    }
  }
}