var videoPlayerContainer = document.getElementById("video-player-container");
var videoCloseButton = document.getElementById("video-close-button");
var videoPlayer = document.getElementById("video-player");
var videoSource = document.getElementById("video-source");
var videoTitle = document.getElementById("video-title");
var videoSourceText = document.getElementById("video-source-text");
var videoOverlay = document.getElementById("video-overlay");
videoOverlay.style.opacity = 0;

videoPlayer.addEventListener("mouseenter", showOverlay);
videoPlayer.addEventListener("mouseleave", hideOverlay);
videoCloseButton.addEventListener("click", onCloseClicked);

function showOverlay()
{
    videoOverlay.style.opacity = 1;
}

function hideOverlay()
{
    videoOverlay.style.opacity = 0;
}

function onCloseClicked()
{
    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayerContainer.style.display = "none";
}

function showVideo(url, title, source)
{
    videoPlayerContainer.style.display = "block";
    videoPlayer.setAttribute("src", url);
    videoTitle.innerText = title;
    videoSourceText.innerText = source;

    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.load();
}
