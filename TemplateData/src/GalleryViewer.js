const galleryContainer = document.getElementById('gallery-container');
const imageContainer = document.getElementById('image-container');
const indexLabel = document.getElementById('gallery-index-label');
const titleLabel = document.getElementById('gallery-image-title');

var index = 0;

const imageElements = [];
const imageTitles = [];

const nextButton = document.getElementById('gallery-next-button');
const previousButton = document.getElementById('gallery-previous-button');
const closeButton = document.getElementById('gallery-close-button');

nextButton.addEventListener('click', onNextClicked);
previousButton.addEventListener('click', onPreviousClicked);
closeButton.addEventListener('click', onCloseClicked);

function setTranslateProperty(translate)
{
    imageElements.forEach(element=>{
        element.style.setProperty('transform', translate);
    });
}

function updateLabels()
{
    indexLabel.textContent = `${index + 1}/${imageElements.length}`;
    titleLabel.textContent = imageTitles[index];
}

function onNextClicked()
{
    index = (index + 1) % imageElements.length;
    const translate = `translateX(-${index}00%)`;
    setTranslateProperty(translate);
    updateLabels();
}

function onPreviousClicked()
{
    index = (index - 1);
    index = index < 0 ? imageElements.length - 1 : index;
    const translate = `translateX(-${index}00%)`;
    setTranslateProperty(translate);
    updateLabels();
}

function onCloseClicked()
{
    HideGallery();
}

function clearImages()
{
    imageElements.forEach(element=>{
        imageContainer.removeChild(element);
    });

    imageElements.splice(0, imageElements.length);
    imageTitles.splice(0, imageTitles.length);
}

function loadImages(images)
{
    images.forEach(element => {
        const img = document.createElement("img");
        img.setAttribute('src', element.Url);
        img.setAttribute('class', 'gallery-slide');
        imageContainer.append(img);
        imageElements.push(img);
        imageTitles.push(element.Title);
    });

    index = 0;
    length = images.length;

    updateLabels();
}

function ShowGallery(images)
{
    galleryContainer.style.display = 'block';
    clearImages();
    loadImages(images.Images);
}

function HideGallery()
{
    galleryContainer.style.display = 'none';
}
