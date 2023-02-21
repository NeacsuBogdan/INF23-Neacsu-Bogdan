console.log('Pagina s-a încărcat!');

function changeBackground(color) {
document.body.style.backgroundColor = color; // schimba culoarea de fundal a paginii
document.body.style.color = (color == 'white') ? 'black' : 'white'; // schimba culoarea textului
}