function toggleSideNav() {
  const nav = document.getElementById("sideNav");
  if (nav.style.left === "0px") {
    nav.style.left = "-260px";
  } else {
    nav.style.left = "0px";
  }
}

function closeNav() {
  document.getElementById("sideNav").style.left = "-260px";
}

/* Carousel */
let slides = document.querySelectorAll(".slide");
let index = 0;

setInterval(() => {
  slides[index].classList.remove("active");
  index = (index + 1) % slides.length;
  slides[index].classList.add("active");
}, 2500);

