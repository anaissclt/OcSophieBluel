/*** 
Récupérations des images via javascript
***/

// Lien vers l'API
const apiUrl = 'http://localhost:5678/api/';

// Fonction qui récupére les projets
async function recoverProjects() {
  const response = await fetch(apiUrl + 'works');
  return response.json();
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
Filtrer les projets par catégories 
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

  // Vérifier si l'élément avec la classe ".gallery" existe
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
Authentification de l’utilisateur
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
            throw new Error('Erreur dans l’identifiant ou le mot de passe.');
          }

          const data = await response.json();

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
Deconnection de l'utilisateur
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
Ajout de la fenêtre modale
***/

async function viewProjectsModal() {
  const projects = await recoverProjects(); // Fonction qui récupére les projets 
  const galleryModal = document.querySelector('.galleryModal');

  galleryModal.innerHTML = '';

  projects.forEach(project => {
    // Création de la carte de projet
    const projectCard = document.createElement('figure');
    // Ajout de l'image 
    const imgElement = document.createElement('img');
    imgElement.src = project.imageUrl;
    imgElement.alt = project.title;
    // Ajout de l'encadré noir et de l'icône FontAwesome
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');
    iconContainer.innerHTML = '<i class="fa-solid fa-trash"></i>';

    // Ajout de l'image et de l'encadré avec l'icône dans la carte du projet
    projectCard.appendChild(imgElement);
    projectCard.appendChild(iconContainer);

    galleryModal.appendChild(projectCard);
  });
}

// Fonctions pour ouvrir/fermer la modale
function ouvrirModal() {
  modal.style.display = 'block';
  viewProjectsModal(); // Afficher les projets dans la galerie de la modal
}

function fermerModal() {
  modal.style.display = 'none';
  const galleryModal = document.querySelector('.galleryModal');
  galleryModal.innerHTML = ''; // Effacer le contenu de la galerie de la modal
}