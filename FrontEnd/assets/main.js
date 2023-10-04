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
  const projects = await recoverProjects();
  const gallery = document.querySelector('.gallery');

  projects.forEach(project => {  // parcourir chaque projet dans la liste 
    const projectCard = document.createElement('figure');
    projectCard.innerHTML = `<img src="${project.imageUrl}" alt="${project.title}"><figcaption>${project.title}</figcaption>`;
    gallery.appendChild(projectCard);
  });
}

viewProjects();


/*** 
Filtrer les projets par catégories 
***/

// variable qui stocke les données des projets

let storeData = [];

// fonction qui récupère les projets depuis l'API 

async function fetchProjects() {
  const response = await fetch(apiUrl + 'works');
  if (!response.ok) return;

  storeData = await response.json();
  viewFilteredProjects();
  categoryButtons();
}

// fonction qui extrait les catégories des projets

function extractCategories() {
  const categoryNames = storeData.map(project => project.category?.name).filter(Boolean); // filtrer les valeurs nulles/ non définies
  const uniqueCategoryNames = new Set(categoryNames); // Stocker ces noms dans un ensemble (Set)
  const categoriesArray = ['Tous', ...Array.from(uniqueCategoryNames)]; // Convertir en tableau
  return categoriesArray;
}

// fonction qui affiche les boutons pour chaque catégorie 

function categoryButtons() {
  const filtersContainer = document.querySelector('.filters');
  const categories = extractCategories(); // Obtenir les catégories à afficher

  filtersContainer.innerHTML = ''; // Effacer les boutons précédents

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
  gallery.innerHTML = ''; // efface les éléments précédents 
  // Afficher chaque projet dans la galerie
  (filteredProjects || storeData).forEach(project => {
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
    ? storeData // Si catégorie = "Tous", afficher tous les projets
    : storeData.filter(project => project.category?.name === category);

  viewFilteredProjects(filteredProjects);
}

document.addEventListener("DOMContentLoaded", fetchProjects);


/*** 
Authentification de l’utilisateur
***/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Empêcher le rechargement de la page

      // Récupérer les valeurs du formulaire
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        //Création de l'objet connexion
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
          throw new Error('Identifiant ou mot de passe incorrecte. Veuillez réessayer.');
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
  const logoutBtn = document.getElementById('loginLogout');
  const editBanner = document.querySelector('.banner');

  // Vérifier si l'utilisateur est connecté
  const token = localStorage.getItem('token');
  if (token) {
    // Utilisateur connecté, afficher "Logout" et ajouter l'événement de déconnexion
    logoutBtn.innerText = 'logout';
    editBanner.style.display = 'block';
    logoutBtn.addEventListener('click', () => {
      // Supprimer le token et rediriger vers la page d'accueil
      localStorage.removeItem('token');
      editBanner.style.display = 'none';
      window.location.href = './index.html';
    });
       // Si l'utilisateur n'est pas connecté, masquer la classe "filters"
       hideFilters();

  } else {
    // Utilisateur non connecté, afficher "Login" et rediriger vers login.html au clic
    logoutBtn.innerText = 'login';
    logoutBtn.addEventListener('click', () => {
      window.location.href = './assets/login.html';
    });
    // Si l'utilisateur se déconnecte, réafficher la classe "filters"
    showFilters();
  }
});

/*** 
Ajout de la fenêtre modale
***/