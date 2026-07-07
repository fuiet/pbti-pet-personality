document.addEventListener('DOMContentLoaded',()=>{

const header=document.querySelector('.header');

window.addEventListener('scroll',()=>{
 if(window.scrollY>80){
  header.style.background='rgba(20,30,22,.92)';
 }else{
  header.style.background='rgba(0,0,0,.18)';
 }
});

const elements=document.querySelectorAll('.cards div,.section h2,.trust');

const observer=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(entry.isIntersecting){
   entry.target.style.opacity='1';
   entry.target.style.transform='translateY(0)';
  }
 });
},{threshold:.15});

elements.forEach(el=>{
 el.style.opacity='0';
 el.style.transform='translateY(40px)';
 el.style.transition='all .8s ease';
 observer.observe(el);
});

const buttons=document.querySelectorAll('.button');
buttons.forEach(btn=>{
 btn.addEventListener('mouseenter',()=>{
  btn.style.transform='translateY(-3px)';
  btn.style.boxShadow='0 15px 35px rgba(185,154,98,.35)';
 });
 btn.addEventListener('mouseleave',()=>{
  btn.style.transform='translateY(0)';
  btn.style.boxShadow='none';
 });
});

});