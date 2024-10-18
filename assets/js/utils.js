// This is built for Toggle buttons icon
// Used to rotate the triangle icon inside the button.

function rotateTriangle(e){
    let id = e.value
    const icon = document.getElementById(id);
    if (icon.style.transform === 'rotate(90deg)') {
      icon.style.transform = 'rotate(0deg)'
    } else {
      icon.style.transform = 'rotate(90deg)'
    }
  }
    