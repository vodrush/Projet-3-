window.addEventListener('DOMContentLoaded', function() {
    const maDiv = document.getElementById('gallery');
    const filtreDiv = document.querySelector('.filtre');
    const categories = ['Tous', 'Objets', 'Appartements', 'Hotels & restaurants'];

    function filtrerParCategorie(categorie) {
        maDiv.innerHTML = '';
        fetch('http://localhost:5678/imageNames')
            .then(response => response.json())
            .then(data => {
                const sortedImages = data.imageNames.map(fileName => {
                    const [number, category, ...titleParts] = fileName.split('-');
                    const title = titleParts.join('-').replace(/\.[^/.]+$/, '');
                    return { fileName, number: parseInt(number), category, title };
                }).sort((a, b) => a.number - b.number);

                sortedImages.forEach(file => {
                    if (categorie === 'tous' || file.category.toLowerCase().includes(categorie)) {
                        const container = document.createElement('div');
                        container.className = 'image-container';

                        const image = document.createElement('img');
                        image.src = `http://localhost:5678/images/${file.fileName}`;
                        image.onerror = function() {
                            console.error('Error loading image:', this.src);
                            this.alt = 'Image load error';
                        };

                        const imageCaption = document.createElement('p');
                        imageCaption.textContent = file.title;

                        container.appendChild(image);
                        container.appendChild(imageCaption);
                        maDiv.appendChild(container);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching image names:', error);
                maDiv.textContent = 'Erreur lors du chargement des images.';
            });
    }

    function updateActiveButton(currentBtn) {
        document.querySelectorAll('.filtre button').forEach(btn => btn.classList.remove('active'));
        currentBtn.classList.add('active');
    }

    const buttons = categories.map(categorie => {
        const btn = document.createElement('button');
        btn.textContent = categorie;
        const id = categorie === "Hotels & restaurants" ? "hotelsrestaurants" : categorie.toLowerCase().replace(/\s+/g, '');
        btn.id = id;
        btn.addEventListener('click', function() {
            updateActiveButton(btn);
            filtrerParCategorie(id);
        });
        return btn;
    });
    buttons.forEach(btn => filtreDiv.appendChild(btn));

    const tousBtn = buttons.find(btn => btn.textContent === 'Tous');
    if (tousBtn) {
        updateActiveButton(tousBtn);
        filtrerParCategorie('tous');
    }
});
