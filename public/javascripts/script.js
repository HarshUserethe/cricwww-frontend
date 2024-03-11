var left = document.querySelector(".ri-arrow-left-s-line");
var right = document.querySelector(".ri-arrow-right-s-line");
var mainBody = document.querySelector(".main-body");

right.addEventListener("click", () => {
mainBody.scrollLeft += mainBody.offsetWidth;
})

left.addEventListener("click", () => {
mainBody.scrollLeft -= mainBody.offsetWidth;
})

 
