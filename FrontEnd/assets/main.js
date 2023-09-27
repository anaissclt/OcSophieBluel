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

// Afficher les projets dans la galerie 

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