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

  projects.forEach((project) => {
    // Création de la carte de projet
    const projectCard = document.createElement('figure');
    // Ajout de l'image 
    const imgElement = document.createElement('img');
    imgElement.src = project.imageUrl;
    imgElement.alt = project.title;
    // Ajout de la poubelle
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');
    iconContainer.innerHTML = `<i class="fa-solid fa-trash" data-project-id="${project.id}"></i>`;

    // Ajout d'un event listener pour la suppression
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
}

/*** 
Suppression d'un projet
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
  const projectId = parseInt(event.target.getAttribute('data-project-id'));
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 204) {  // indique que la requête a réussi mais que le client n'a pas besoin de quitter la page actuelle
      // maj galerie page d'accueil
      await majAccueil();

      // maj galerie modale
      await majModale();
    } else if (response.status === 401) { // indique que la requête n'a pas été effectuée, car il manque des informations d'authentification valides pour la ressource visée
      alert('Vous n\'êtes pas autorisé à supprimer ce projet');
      window.location.href = 'login.html';
    } else {
      console.error('Erreur lors de la suppression du projet:', response.status);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
  }
}



/*** 
Affichage de la modale formulaire
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
  // Afficher la modale actuelle
  modal.style.display = 'block';
}



/*** 
Formulaire, ajout image
***/

let ImgUser = ''; // Variable pour stocker l'image en base64

document.addEventListener('DOMContentLoaded', () => {
  const indexPage = window.location.pathname.includes('index.html');


  if (indexPage) {


    const photoInput = document.getElementById('photo');
    const photoIcon = document.getElementById('projetFormIcon');
    const photoLabel = document.getElementById('projetFormAdd');
    const projetFormPhoto = document.querySelector('.projetFormPhoto');


    function displaySelectedPhoto(event) {
      const file = event.target.files[0];


      if (file) {
        const reader = new FileReader();

        // Vérifier le type de fichier et la taille
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          alert('Le fichier doit être au format JPG ou PNG.');
          return;
        }

        if (file.size > 4 * 1024 * 1024) {
          alert('Le fichier est trop grand (4Mo maximum).');
          return;
        }

        ImgUser = file.name; // Récupérer le titre du fichier
        console.log('Image:', ImgUser);

        reader.onload = function (e) {
          const previewImage = document.createElement('img');
          previewImage.src = e.target.result;
          previewImage.setAttribute('class', 'preview-photo');

          // Cacher l'icône et le label
          photoIcon.classList.add('hidden');
          photoLabel.classList.add('hidden');

          while (projetFormPhoto.firstChild) {
            projetFormPhoto.removeChild(projetFormPhoto.firstChild);
          }
          projetFormPhoto.appendChild(previewImage);
        };

        reader.readAsDataURL(file);
      }
    }

    if (photoInput) {
      photoInput.addEventListener('change', displaySelectedPhoto);
    } else {
      console.error('Élément avec l\'ID "photo" non trouvé.');
    }
  }
});



/*** 
Formulaire, afficher les catégories
***/

let categoryIdUser = ''; // Variable pour stocker l'ID de la catégorie sélectionnée

const projetFormCategorie = document.getElementById('projetFormCategorie');

if (projetFormCategorie) {
  projetFormCategorie.addEventListener('change', (event) => {
    categoryIdUser = event.target.value;
    console.log('ID de la catégorie sélectionnée:', categoryIdUser);
  });
}

async function fetchCategoriesFromAPI() {
  try {
    const apiUrl = 'http://localhost:5678/api/categories';
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('La requête n\'a pas abouti :(');
    }
    const data = await response.json();
    const categoryNames = data.map(category => category.name);
    return categoryNames;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories depuis l\'API:', error);
    return [];
  }
}

function extractCategoriesId(data) {
  const categoriesMap = {};

  data.forEach(project => {
    const category = project.category;
    if (category) {
      const categoryId = category.id.toString(); // Convertir l'ID en chaîne de caractères
      categoriesMap[categoryId] = category.name; // Stocker dans l'objet avec l'ID comme clé
    }
  });

  return categoriesMap;
}

async function populateCategories() {
  const projetFormCategorie = document.getElementById('projetFormCategorie');
  const categoriesMap = await fetchCategoriesFromAPI();

  // Ajouter une option vide
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '';
  projetFormCategorie.appendChild(emptyOption);

  // Ajouter les catégories sur la liste déroulante
  for (const categoryId in categoriesMap) {
    const option = document.createElement('option');
    option.value = categoryId; // Utiliser l'ID de la catégorie comme valeur
    option.textContent = `${categoriesMap[categoryId]}`; // Afficher le nom et l'ID
    option.id = `categoryId-${categoryId}`; // Attribuer un ID unique
    projetFormCategorie.appendChild(option);
  }
}

// Appeler la fonction pour peupler les catégories lors du chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const indexPage = window.location.pathname.includes('index.html');

  if (indexPage) {
    populateCategories().catch(err => console.error(err));
  }
});



/*** 
Formulaire, Récupérer le texte 
***/

let textUser = ''; // Variable pour stocker le texte de l'utilisateur

const projetFormName = document.getElementById('projetFormName');

if (projetFormName) {
  projetFormName.addEventListener('input', (event) => {
    textUser = event.target.value;
    console.log('Texte saisi par l\'utilisateur:', textUser);
  });
}



/*** 
Formulaire, envoyer le projet 
***/


const submitFormButton = document.getElementById('formModalValide');

if (submitFormButton) {
  submitFormButton.addEventListener('click', () => {
    // Récupérer les valeurs du formulaire
    const projetFormName = document.getElementById('projetFormName').value;

    // Vérifier si l'utilisateur a sélectionné une catégorie
    if (!categoryIdUser) {
      alert('Veuillez sélectionner une catégorie.');
      return;
    }

    // Récupérer le fichier image
    const photoInput = document.querySelector('#photo');
    const file = photoInput.files[0];

    // Vérifier si l'utilisateur a ajouté une image
    if (!file) {
      alert('Veuillez ajouter une image.');
      return;
    }

    // Vérifier si le texte a été saisi
    if (!projetFormName) {
      alert('Veuillez saisir un titre pour le projet.');
      return;
    }

    // Vérifier la taille de l'image (moins de 4 Mo)
    const imageSizeInMb = file.size / (1024 * 1024); // Convertir en Mo
    if (imageSizeInMb > 4) {
      alert('L\'image dépasse la taille maximale autorisée (4 Mo).');
      return;
    }

    // Créer un objet FormData pour envoyer les données du projet
    const formData = new FormData();
    formData.append('title', textUser);
    formData.append('category', categoryIdUser);
    formData.append('image', ImgUser, 'image.jpg');

    // Envoyer les données du projet à l'API
    envoyerProjetVersAPI(formData);
  });
}


function extractBase64Image() {
  const previewImage = document.querySelector('.preview-photo');
  if (previewImage) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = previewImage.width;
    canvas.height = previewImage.height;
    context.drawImage(previewImage, 0, 0);

    // Convertir le contenu du canvas en base64
    const base64Image = canvas.toDataURL('image/jpeg');

    return base64Image;
  }

  return null;
}

async function envoyerProjetVersAPI(formData) {
  try {
    const response = await fetch(apiUrl + 'works', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout du projet à l\'API. Code d\'erreur : ' + response.status);
    }

    alert('Projet ajouté avec succès!');
    // Actualiser la galerie
    await majAccueil();
    await majModale();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du projet à l\'API:', error);
    alert('Une erreur s\'est produite lors de l\'ajout du projet.');
  }
}
