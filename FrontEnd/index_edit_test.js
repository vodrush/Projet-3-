document.addEventListener('DOMContentLoaded', function () {
    const loginStatusDiv = document.getElementById('loginStatus');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
        window.location.href = './login.html';
    } else {
        setupEditIcon();
    }

    const maDiv = document.getElementById('gallery');
    const categories = ['Tous', 'Objets', 'Appartements', 'hotelsrestaurants'];

    function updateServerImageList() {
        fetch('http://localhost:5678/updateImageList')
            .then(response => response.json())
            .then(data => {
                console.log('Liste des images serveur mise à jour');
            })
            .catch(error => console.error('Erreur lors de la mise à jour de la liste des images sur le serveur :', error));
    }

    function filtrerParCategorie(categorie) {
        maDiv.innerHTML = '';
        fetch('http://localhost:5678/imageNames')
            .then(response => response.json())
            .then(data => {
                data.imageNames.forEach(fileName => {
                    const imagePath = 'http://localhost:5678/images/' + fileName;
                    fetch(imagePath, { method: 'HEAD' })
                        .then(response => {
                            if (response.ok) {
                                if (categorie === 'Tous' || fileName.toLowerCase().includes(categorie.toLowerCase())) {
                                    const image = document.createElement('img');
                                    image.src = imagePath;
                                    maDiv.appendChild(image);
                                }
                            }
                        });
                });
            })
            .catch(error => console.error('Erreur lors de la récupération des noms de fichiers des images :', error));
    }

    // Mise à jour de la liste des images sur le serveur lors du chargement de la page
    updateServerImageList();

    filtrerParCategorie('Tous');

    document.getElementById('logout').addEventListener('click', function () {
        localStorage.clear();
        window.location.href = './index.html';
    });

    function setupEditIcon() {
        const modifDiv = document.getElementById('modif');
        if (modifDiv && !modifDiv.querySelector('#iconedit')) {
            const title = document.createElement('h2');
            title.textContent = 'Mes Projets';

            const icon = document.createElement('i');
            icon.className = 'fa-regular fa-pen-to-square';
            icon.style.fontSize = '14px';
            icon.style.cursor = 'pointer';
            icon.onclick = editProject;
            icon.id = 'iconedit';

            const icontext = document.createElement('p');
            icontext.textContent = 'modifier';
            icontext.onclick = editProject;
            icontext.style.fontSize = '14px';
            icontext.style.cursor = 'pointer';

            modifDiv.appendChild(title);
            modifDiv.appendChild(icon);
            modifDiv.appendChild(icontext);
        }
    }

    function openModal() {
        const modal = document.getElementById('myModal');
        const modalGallery = document.getElementById('modalGallery');

        if (modalGallery) {
            modalGallery.innerHTML = '';

            fetch('http://localhost:5678/imageNames')
                .then(response => response.json())
                .then(data => {
                    data.imageNames.forEach(fileName => {
                        const imagePath = 'http://localhost:5678/images/' + fileName;
                        fetch(imagePath, { method: 'HEAD' })
                            .then(response => {
                                if (response.ok) {
                                    const imageContainer = document.createElement('div');
                                    imageContainer.className = 'image-container';

                                    const image = document.createElement('img');
                                    image.src = imagePath;
                                    imageContainer.appendChild(image);

                                    const icontrash = document.createElement('i');
                                    icontrash.className = 'fa fa-trash overlay-icon';
                                    icontrash.addEventListener('click', function () {
                                        fetch('http://localhost:5678/deleteImage', {
                                            method: 'DELETE',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({ imageName: fileName })
                                        })
                                            .then(response => response.text())
                                            .then(result => {
                                                console.log(result);
                                                modalGallery.removeChild(imageContainer);
                                                filtrerParCategorie('Tous'); // Actualiser la galerie
                                            })
                                            .catch(error => console.error('Erreur lors de la suppression de l\'image :', error));
                                    });
                                    imageContainer.appendChild(icontrash);
                                    modalGallery.appendChild(imageContainer);
                                }
                            });
                    });
                })
                .catch(error => console.error('Erreur lors de la récupération des noms de fichiers des images :', error));

            modal.style.display = 'block';
        }
    }

    function showGalleryModal() {
        const modal = document.getElementById('myModal');
        const modalContent = modal.querySelector('.modal-content');

        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>Galerie photo</h2>
            <div id="modalGallery" class="gallery-grid"></div>
            <button class="btn-add-photo">Ajouter une photo</button>
        `;

        const closeSpan = modalContent.querySelector('.close');
        if (closeSpan) {
            closeSpan.addEventListener('click', function () {
                closeModal(modal);
            });
        }

        const addPhotoButton = modalContent.querySelector('.btn-add-photo');
        if (addPhotoButton) {
            addPhotoButton.addEventListener('click', function () {
                showAddPhotoForm();
            });
        }

        openModal();
    }

    function showAddPhotoForm() {
        const modal = document.getElementById('myModal');
        const modalContent = modal.querySelector('.modal-content');

        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <i class="fa-solid fa-arrow-left back-arrow"></i>
            <h2>Ajout photo</h2>
            <form id="addPhotoForm">
                <section class="containerphoto">
                    <div class="upload-container">
                        <label for="photoFile" class="upload-label">
                            <img src="./assets/images/picture-svgrepo-com 1.png" alt="Upload Icon" class="upload-icon">
                            <span id="ajoutphotobtn">+ Ajouter photo</span>
                            <span id="catphoto">jpg, png : 4mo max</span>
                        </label>
                        <input type="file" id="photoFile" name="photoFile" accept=".jpg,.jpeg,.png" required>
                        <img id="imagePreview" class="image-preview" style="display:none;">
                        <span class="close-preview close" style="display:none;">&times;</span>
                    </div>
                </section>
                <label for="photoTitle" class="phototitres">Titre</label>
                <div class="inputajoutphoto">
                    <input type="text" id="photoTitle" name="photoTitle" required>
                </div>
                <label for="photoCategory" class="phototitres">Catégorie</label>
                <div class="inputajoutphoto">
                    <select id="photoCategory" name="photoCategory" required>
                        <option value="">Sélectionner une catégorie</option>
                        <option value="Objets">Objets</option>
                        <option value="Appartements">Appartements</option>
                        <option value="hotelsrestaurants">Hotels & restaurants</option>
                    </select>
                </div>
                <div class="submit-container">
                    <button type="submit" id="submitBtn">Valider</button>
                </div>
            </form>
        `;

        const closeSpan = modalContent.querySelector('.close');
        if (closeSpan) {
            closeSpan.addEventListener('click', function () {
                closeModal(modal);
            });
        }

        const backArrow = modalContent.querySelector('.back-arrow');
        if (backArrow) {
            backArrow.addEventListener('click', function () {
                showGalleryModal();
            });
        }

        const photoFileInput = modalContent.querySelector('#photoFile');
        const imagePreview = modalContent.querySelector('#imagePreview');
        const uploadLabel = modalContent.querySelector('.upload-label');
        const closePreview = modalContent.querySelector('.close-preview');

        if (photoFileInput && imagePreview && uploadLabel && closePreview) {
            photoFileInput.addEventListener('change', function () {
                const file = photoFileInput.files[0];
                if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
                    alert('Le fichier doit être un JPG ou un PNG.');
                    photoFileInput.value = '';
                    imagePreview.style.display = 'none';
                    uploadLabel.style.display = 'flex';
                    closePreview.style.display = 'none';
                    return;
                }
                if (file.size > 4 * 1024 * 1024) {
                    alert('Le fichier doit être inférieur à 4 Mo.');
                    photoFileInput.value = '';
                    imagePreview.style.display = 'none';
                    uploadLabel.style.display = 'flex';
                    closePreview.style.display = 'none';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    uploadLabel.style.display = 'none';
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    closePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            });

            closePreview.addEventListener('click', function () {
                photoFileInput.value = '';
                imagePreview.src = '';
                imagePreview.style.display = 'none';
                uploadLabel.style.display = 'flex';
                closePreview.style.display = 'none';
            });

            const form = modalContent.querySelector('#addPhotoForm');
            if (form) {
                form.addEventListener('submit', function (event) {
                    event.preventDefault();

                    const file = photoFileInput.files[0];
                    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
                        alert('Le fichier doit être un JPG ou un PNG.');
                        return;
                    }
                    if (file.size > 4 * 1024 * 1024) {
                        alert('Le fichier doit être inférieur à 4 Mo.');
                        return;
                    }

                    const photoTitle = document.getElementById('photoTitle').value;
                    const photoCategory = document.getElementById('photoCategory').value.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');

                    const formData = new FormData();
                    formData.append('photoFile', file);
                    formData.append('photoTitle', photoTitle);
                    formData.append('photoCategory', photoCategory);

                    fetch('http://localhost:5678/uploadImage', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.text())
                        .then(result => {
                            closeModal(modal);
                            // Ajout de l'image à la galerie sans recharger
                            const image = document.createElement('img');
                            image.src = URL.createObjectURL(file);
                            maDiv.appendChild(image);
                        })
                        .catch(error => console.error('Erreur lors du téléchargement de l\'image :', error));
                });
            }
        }

        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>Galerie photo</h2>
            <div id="modalGallery" class="gallery-grid"></div>
            <button class="btn-add-photo">Ajouter une photo</button>
        `;

        const addPhotoButton = modalContent.querySelector('.btn-add-photo');
        if (addPhotoButton) {
            addPhotoButton.addEventListener('click', function () {
                showAddPhotoForm();
            });
        }

        const closeSpan = modalContent.querySelector('.close');
        if (closeSpan) {
            closeSpan.addEventListener('click', function () {
                modal.style.display = 'none';
            });
        }
    }

    const addPhotoButton = document.querySelector('.btn-add-photo');
    if (addPhotoButton) {
        addPhotoButton.addEventListener('click', function () {
            showAddPhotoForm();
        });
    }

    function editProject() {
        showGalleryModal();
    }

    // Suppression de l'appel à setupModal qui n'est pas défini
    // setupModal();
});
